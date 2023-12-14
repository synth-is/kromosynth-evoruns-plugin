#include "PluginProcessor.h"
#include "WebViewEditor.h"

#include <iostream>
#include <fstream>

#include <vector>
#include <string_view>

// include juce audio formats
#include <juce_audio_formats/juce_audio_formats.h>
// include juce audio basics
#include <juce_audio_basics/juce_audio_basics.h>


// A helper for reading numbers from a choc::Value, which seems to opportunistically parse
// JSON numbers into ints or 32-bit floats whenever it wants.
double numberFromChocValue(const choc::value::ValueView& v) {
    return (
        v.isFloat32() ? (double) v.getFloat32()
            : (v.isFloat64() ? v.getFloat64()
                : (v.isInt32() ? (double) v.getInt32()
                    : (double) v.getInt64())));
}

std::string getMimeType(std::string const& ext) {
    static std::unordered_map<std::string, std::string> mimeTypes {
        { ".html",   "text/html" },
        { ".js",     "application/javascript" },
        { ".css",    "text/css" },
    };

    if (mimeTypes.count(ext) > 0)
        return mimeTypes.at(ext);

    return "application/octet-stream";
}

//==============================================================================
WebViewEditor::WebViewEditor(juce::AudioProcessor* proc, juce::File const& assetDirectory, int width, int height)
    : juce::AudioProcessorEditor(proc)
{
    setSize(720, 444);

    choc::ui::WebView::Options opts;

#if JUCE_DEBUG
    opts.enableDebugMode = true;
#endif

#if ! ELEM_DEV_LOCALHOST
    opts.fetchResource = [=](const choc::ui::WebView::Options::Path& p) -> std::optional<choc::ui::WebView::Options::Resource> {
        auto relPath = "." + (p == "/" ? "/index.html" : p);
        auto f = assetDirectory.getChildFile(relPath);
        juce::MemoryBlock mb;

        if (!f.existsAsFile() || !f.loadFileAsData(mb))
            return {};

        return choc::ui::WebView::Options::Resource {
            std::vector<uint8_t>(mb.begin(), mb.end()),
            getMimeType(f.getFileExtension().toStdString())
        };
    };
#endif

    webView = std::make_unique<choc::ui::WebView>(opts);

#if JUCE_MAC
    viewContainer.setView(webView->getViewHandle());
#elif JUCE_WINDOWS
    viewContainer.setHWND(webView->getViewHandle());
#else
#error "We only support MacOS and Windows here yet."
#endif

    addAndMakeVisible(viewContainer);
    viewContainer.setBounds({0, 0, 720, 440});

    // Install message passing handlers
    webView->bind("__postNativeMessage__", [=](const choc::value::ValueView& args) -> choc::value::Value {
        if (args.isArray()) {
            auto eventName = args[0].getString();

            // When the webView loads it should send a message telling us that it has established
            // its message-passing hooks and is ready for a state dispatch
            if (eventName == "ready") {
                if (auto* ptr = dynamic_cast<EffectsPluginProcessor*>(getAudioProcessor())) {
                    ptr->dispatchStateChange();
                }
            }
            if( eventName == "updateSharedResourceMap" ) {
                jassert(args.size() > 1);
                handleUpdateSharedResourceMapEvent(args[1]);
            }

#if ELEM_DEV_LOCALHOST
            if (eventName == "reload") {
                if (auto* ptr = dynamic_cast<EffectsPluginProcessor*>(getAudioProcessor())) {
                    ptr->initJavaScriptEngine();
                    ptr->dispatchStateChange();
                }
            }
#endif

            if (eventName == "setParameterValue") {
                jassert(args.size() > 1);
                return handleSetParameterValueEvent(args[1]);
            }
        }

        return {};
    });

#if ELEM_DEV_LOCALHOST
    webView->navigate("http://localhost:5173");
#endif
}

choc::ui::WebView* WebViewEditor::getWebViewPtr()
{
    return webView.get();
}

void WebViewEditor::paint (juce::Graphics& g)
{
}

void WebViewEditor::resized()
{
    viewContainer.setBounds(getLocalBounds());
}

//==============================================================================
choc::value::Value WebViewEditor::handleSetParameterValueEvent(const choc::value::ValueView& e) {
    // When setting a parameter value, we simply tell the host. This will in turn fire
    // a parameterValueChanged event, which will catch and propagate through dispatching
    // a state change event
    if (e.isObject() && e.hasObjectMember("paramId") && e.hasObjectMember("value")) {
        auto const& paramId = e["paramId"].getString();
        double const v = numberFromChocValue(e["value"]);

        for (auto& p : getAudioProcessor()->getParameters()) {
            if (auto* pf = dynamic_cast<juce::AudioParameterFloat*>(p)) {
                if (pf->paramID.toStdString() == paramId) {
                    pf->setValueNotifyingHost(v);
                    break;
                }
            }
        }
    }

    return choc::value::Value();
}

void WebViewEditor::handleUpdateSharedResourceMapEvent(const choc::value::ValueView& e) {
    if( e.isObject() && e.hasObjectMember("path") && e.hasObjectMember("url") ) {

        const std::string_view& urlStringView = e["url"].getString();
        std::string urlString(urlStringView.begin(), urlStringView.end());
        juce::URL audioFileURL(urlString);

        std::vector<float> audioData;
        double sampleRate = 0;
        int numChannels = 0;

        downloadAndExtractAudioData(audioFileURL, audioData, sampleRate, numChannels);

        if (auto* ptr = dynamic_cast<EffectsPluginProcessor*>(getAudioProcessor())) {
            const std::string_view& pathStringView = e["path"].getString();
            std::string pathString(pathStringView.begin(), pathStringView.end());

            ptr->updateSharedResourceMap(pathString, audioData);
        }

        std::string audioDataLengthString = std::to_string(audioData.size());
        logFileWebView.open("/tmp/midi_handleUpdateSharedResourceMapEvent_logs.txt", std::ios_base::app);
        logFileWebView << "audioDataLengthString: " << audioDataLengthString << std::endl;
        logFileWebView.close();
    }
}


bool WebViewEditor::downloadToFile(const juce::URL& audioFileURL, const juce::File& targetFile)
{
    std::unique_ptr<juce::InputStream> inputStream(audioFileURL.createInputStream(false));
    if (inputStream != nullptr)
    {
        // Open a stream to write to the target file
        std::unique_ptr<juce::FileOutputStream> fileOutputStream(targetFile.createOutputStream());
        if (fileOutputStream != nullptr)
        {
            fileOutputStream->writeFromInputStream(*inputStream.get(), -1);
            return true;  // Download was successful
        }
    }
    return false;  // Download failed
}

bool WebViewEditor::readAudioFileToVector(const juce::File& audioFile, std::vector<float>& audioData, double& sampleRate, int& numChannels)
{
    juce::AudioFormatManager formatManager;
    formatManager.registerBasicFormats(); // Register the basic formats

    std::unique_ptr<juce::AudioFormatReader> reader(formatManager.createReaderFor(audioFile));

    if (reader != nullptr)
    {
        // Initialize the audio buffer
        juce::AudioBuffer<float> buffer(reader->numChannels, (int)reader->lengthInSamples);
        reader->read(&buffer, 0, (int)reader->lengthInSamples, 0, true, true);

        // Set the output parameters
        sampleRate = reader->sampleRate;
        numChannels = reader->numChannels;

        // Flatten the buffer to a single array (interleaving if necessary)
        audioData.clear();
        audioData.reserve(buffer.getNumSamples() * buffer.getNumChannels());
        for (int i = 0; i < buffer.getNumSamples(); ++i)
        {
            for (int channel = 0; channel < buffer.getNumChannels(); ++channel)
            {
                audioData.push_back(buffer.getSample(channel, i));
            }
        }

        return true;  // Reading was successful
    }
    return false;  // Reading failed
}

void WebViewEditor::downloadAndExtractAudioData(const juce::URL& audioFileURL, std::vector<float>& audioData, double& sampleRate, int& numChannels)
{
    // Specify where we want to download the file
    juce::File targetFile(juce::File::getSpecialLocation(juce::File::tempDirectory).getChildFile("downloaded_audio_file.wav"));

    // get targetFile location as a string, for logging
    logFileWebView.open("/tmp/midi_handleUpdateSharedResourceMapEvent_logs.txt", std::ios_base::app);
    logFileWebView << "targetFile.getFullPathName(): " << targetFile.getFullPathName() << std::endl;
    logFileWebView.close();


    // Download the file
    if (downloadToFile(audioFileURL, targetFile))
    {
        // Read the downloaded file to a vector
        if (readAudioFileToVector(targetFile, audioData, sampleRate, numChannels))
        {
            // Successfully read the data to vector

            // Optionally, delete the temporary file
            // targetFile.deleteFile();
        }
        else
        {
            juce::Logger::writeToLog("Could not read the audio file into vector");
        }
    }
    else
    {
        juce::Logger::writeToLog("Failed to download the file");
    }
}

