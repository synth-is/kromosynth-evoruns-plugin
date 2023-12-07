# kromosynth-evoruns-plugin

kromosynth-evoruns-plugin is an audio plugin (VST3/AU) for MacOS and Windows. It enables access to rendered artefacts from [kromosynth evoruns](https://synth.is/exploring-evoruns).

This project is based on [SRVB](https://github.com/elemaudio/srvb).

## Getting Started

### Dependencies

Before running the following steps, please make sure you have the following dependencies installed and
available at the command line:

* [CMake](https://cmake.org/)
* [Node.js](https://nodejs.org/en)
* Bash: the build steps below expect to run scripts in a Bash environment. For Windows machines, consider running the following steps in a Git Bash environment, or with WSL.

Next, we fetch the SRVB project and its dependencies,

```bash
# Clone the project with its submodules
git clone --recurse-submodules https://github.com/synth-is/kromosynth-evoruns-plugin.git
cd kromosynth-evoruns-plugin

# Install npm dependencies
npm install
```

### Develop
```bash
npm run dev
```

In develop mode, the native plugin is compiled to fetch its JavaScript assets from localhost, where subsequently we
run the Vite dev server to serve those assets. This arrangement enables Vite's hot reloading behavior for developing
the plugin while it's running inside a host.

### Release
```bash
npm run build
```

In release builds, the JavaScript bundles are packaged into the plugin app bundle so that the resulting bundle
is relocatable, thereby enabling distribution to end users.

### Troubleshooting

* After a successful build with either `npm run dev` or `npm run build`, you
  should have local plugin binaries built and copied into the correct
  audio plugin directories on your machine. If you don't see them, look in
  `./native/build/scripted/SRVB_artefacts` and copy them manually
* **Note**: the CMake build on Windows attempts to copy the VST3 plugin binary
  into `C:\Program Files`, a step that requires admin permissions. Therefore
  you should either run your build as an admin, or disable the copy plugin step
  in `native/CMakeLists.txt` and manually copy the plugin binary after build.
* **Note**: especially on MacOS, certain plugin hosts such as Ableton Live have
  strict security settings that prevent them from recognizing local unsigned
  binaries. You'll want to either add a codesign step to your build, or
  configure the security settings of your host to address this.

## License

[MIT](./LICENSE.md)

This project also uses [JUCE](https://juce.com/), which is licensed GPLv3. Please consult JUCE's license
agreement if you intend to distribute your own plugin based on this template.
