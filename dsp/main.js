import {Renderer, el} from '@elemaudio/core';
import {RefMap} from './RefMap';
import srvb from './srvb';

// This project demonstrates writing a small FDN reverb effect in Elementary.
//
// First, we initialize a custom Renderer instance that marshals our instruction
// batches through the __postNativeMessage__ function to direct the underlying native
// engine.
let core;
if( !core ) {
  core = new Renderer((batch) => {
    console.log("Instantiating Renderer");
    __postNativeMessage__(JSON.stringify(batch));
  });
}

// Next, a RefMap for coordinating our refs
let refs = new RefMap(core);

// Holding onto the previous state allows us a quick way to differentiate
// when we need to fully re-render versus when we can just update refs
let prevState = null;

function shouldRender(prevState, nextState) {
  return (prevState === null) || (prevState.sampleRate !== nextState.sampleRate);
}

// The important piece: here we register a state change callback with the native
// side. This callback will be hit with the current processor state any time that
// state changes.
//
// Given the new state, we simply update our refs or perform a full render depending
// on the result of our `shouldRender` check.
globalThis.__receiveStateChange__ = (serializedState) => {
  console.log("Receiving state change:");
  console.log(serializedState);
  const state = JSON.parse(serializedState);

//   if (shouldRender(prevState, state)) {
//     let stats = core.render(...srvb({
//       key: 'srvb',
//       sampleRate: state.sampleRate,
//       size: refs.getOrCreate('size', 'const', {value: state.size}, []),
//       decay: refs.getOrCreate('decay', 'const', {value: state.decay}, []),
//       mod: refs.getOrCreate('mod', 'const', {value: state.mod}, []),
//       mix: refs.getOrCreate('mix', 'const', {value: state.mix}, []),
//     }, el.in({channel: 0}), el.in({channel: 1})));

//     console.log(stats);
//   } else {
//     refs.update('size', {value: state.size});
//     refs.update('decay', {value: state.decay});
//     refs.update('mod', {value: state.mod});
//     refs.update('mix', {value: state.mix});
//   }

  prevState = state;
};

// NOTE: This is highly experimental and should not yet be relied on
// as a consistent feature.
//
// This hook allows the native side to inject serialized graph state from
// the running elem::Runtime instance so that we can throw away and reinitialize
// the JavaScript engine and then inject necessary state for coordinating with
// the underlying engine.
globalThis.__receiveHydrationData__ = (data) => {
  const payload = JSON.parse(data);
  const nodeMap = core._delegate.nodeMap;

  for (let [k, v] of Object.entries(payload)) {
    nodeMap.set(parseInt(k, 16), {
      symbol: '__ELEM_NODE__',
      kind: '__HYDRATED__',
      hash: parseInt(k, 16),
      props: v,
      generation: {
        current: 0,
      },
    });
  }
};

// Finally, an error callback which just logs back to native
globalThis.__receiveError__ = (err) => {
  console.log(`[Error: ${err.name}] ${err.message}`);
};

let sampleTrigger0 = el.const({key: "sampleTrigger0", value: 0});
let sampleTrigger1 = el.const({key: "sampleTrigger1", value: 0});

// Add a listener for MIDI messages
globalThis.__receiveMidiMessage__ = (msg) => {

  console.log("msg:", msg);

  if( msg.includes("Note on") ) {
    console.log("Note on");
    sampleTrigger0 = el.const({key: "sampleTrigger0", value: 1});
    sampleTrigger1 = el.const({key: "sampleTrigger1", value: 1});
  } else if( msg.includes("Note off") ) {
    console.log("Note off");
    sampleTrigger0 = el.const({key: "sampleTrigger0", value: 0});
    sampleTrigger1 = el.const({key: "sampleTrigger1", value: 0});
  }

  let renderResult = core.render( 
    el.add(
      el.sample( {path: 'sample0'}, sampleTrigger0, 1 )
      , 
      el.sample( {path: 'sample1'}, sampleTrigger1, 0.5 ) 
    )
  );

  console.log("renderResult:", renderResult);
};
