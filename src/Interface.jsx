import React, { useState } from 'react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'

import {
  Button, Header, Icon,
  Card, Checkbox, Input, Label
} from 'semantic-ui-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import Knob from './Knob.jsx';

import manifest from '../public/manifest.json';


// Generated from Lockup.svg using svgr, and then I changed the generated code
// a bit to use a currentColor fill on the text path, and to move the strokeLinejoin/cap
// style properties to actual dom attributes because somehow that was causing problems
// const Logo = (props) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     xmlSpace="preserve"
//     fillRule="evenodd"
//     clipRule="evenodd"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     strokeMiterlimit={1.5}
//     viewBox="0 0 2890 606"
//     {...props}
//   >
//     <path
//       d="M2762.1 519.241c-9.067 0-15.333-3.334-18.8-10-3.467-6.667-3.333-14.267.4-22.8l22.8-50.4-68.4-157.6c-3.733-8.8-3.733-16.534 0-23.2 3.733-6.667 11.067-10 22-10 6.133 0 11.067 1.4 14.8 4.2 3.733 2.8 7.067 8.066 10 15.8l48 120 49.2-120.4c2.933-7.467 6.4-12.6 10.4-15.4 4-2.8 9.333-4.2 16-4.2 8.533 0 14.533 3.333 18 10 3.467 6.666 3.333 14.266-.4 22.8l-97.2 222c-3.467 7.466-7.2 12.533-11.2 15.2-4 2.666-9.2 4-15.6 4Zm-1668-71.2c-44.533 0-66.8-24.934-66.8-74.8v-189.2c0-16.8 8.267-25.2 24.8-25.2 16.8 0 25.2 8.4 25.2 25.2v186.8c0 24 10 36 30 36 2.133 0 4.133-.067 6-.2a80.584 80.584 0 0 0 5.6-.6c3.733-.534 6.267.466 7.6 3 1.333 2.533 2 7.666 2 15.4 0 6.666-1.333 11.866-4 15.6-2.667 3.733-7.067 6-13.2 6.8-5.6.8-11.333 1.2-17.2 1.2Zm1295.2 0c-14.133 0-26.733-2.734-37.8-8.2-11.067-5.467-19.733-12.867-26-22.2-6.267-9.334-9.4-19.867-9.4-31.6 0-14.4 3.733-25.8 11.2-34.2 7.467-8.4 19.6-14.467 36.4-18.2 16.8-3.734 39.333-5.6 67.6-5.6h14v-8.4c0-13.334-2.933-22.934-8.8-28.8-5.867-5.867-15.733-8.8-29.6-8.8-7.733 0-16.067.933-25 2.8-8.933 1.866-18.333 5.066-28.2 9.6-6.4 2.933-11.733 3.266-16 1-4.267-2.267-7.133-5.867-8.6-10.8-1.467-4.934-1.2-9.934.8-15 2-5.067 6.067-8.8 12.2-11.2 12.267-5.067 24.067-8.667 35.4-10.8 11.333-2.134 21.667-3.2 31-3.2 28.533 0 49.733 6.6 63.6 19.8 13.867 13.2 20.8 33.666 20.8 61.4v96c0 17.066-7.733 25.6-23.2 25.6-15.733 0-23.6-8.534-23.6-25.6v-8.8c-4.533 10.933-11.733 19.533-21.6 25.8-9.867 6.266-21.6 9.4-35.2 9.4Zm-1140 0c-22.133 0-41.2-4.134-57.2-12.4-16-8.267-28.333-20-37-35.2-8.667-15.2-13-33.2-13-54 0-20.267 4.2-38 12.6-53.2 8.4-15.2 20-27.134 34.8-35.8 14.8-8.667 31.667-13 50.6-13 27.733 0 49.667 8.8 65.8 26.4 16.133 17.6 24.2 41.6 24.2 72 0 9.866-6.4 14.8-19.2 14.8h-120.8c3.733 34.933 23.733 52.4 60 52.4 6.933 0 14.733-.867 23.4-2.6a85.256 85.256 0 0 0 24.6-9c6.933-4 12.8-5.267 17.6-3.8 4.8 1.466 8.2 4.333 10.2 8.6 2 4.266 2.267 9 .8 14.2-1.467 5.2-5.267 9.666-11.4 13.4-9.333 5.866-20.067 10.2-32.2 13-12.133 2.8-23.4 4.2-33.8 4.2Zm567.6 0c-22.133 0-41.2-4.134-57.2-12.4-16-8.267-28.333-20-37-35.2-8.667-15.2-13-33.2-13-54 0-20.267 4.2-38 12.6-53.2 8.4-15.2 20-27.134 34.8-35.8 14.8-8.667 31.667-13 50.6-13 27.733 0 49.667 8.8 65.8 26.4 16.133 17.6 24.2 41.6 24.2 72 0 9.866-6.4 14.8-19.2 14.8h-120.8c3.733 34.933 23.733 52.4 60 52.4 6.933 0 14.733-.867 23.4-2.6a85.256 85.256 0 0 0 24.6-9c6.933-4 12.8-5.267 17.6-3.8 4.8 1.466 8.2 4.333 10.2 8.6 2 4.266 2.267 9 .8 14.2-1.467 5.2-5.267 9.666-11.4 13.4-9.333 5.866-20.067 10.2-32.2 13-12.133 2.8-23.4 4.2-33.8 4.2Zm444 0c-51.733 0-77.6-25.6-77.6-76.8v-85.2h-20.8c-13.333 0-20-6.267-20-18.8 0-12.534 6.667-18.8 20-18.8h20.8v-36.4c0-16.8 8.4-25.2 25.2-25.2 16.533 0 24.8 8.4 24.8 25.2v36.4h42.4c13.333 0 20 6.266 20 18.8 0 12.533-6.667 18.8-20 18.8h-42.4v82.4c0 12.8 2.8 22.4 8.4 28.8 5.6 6.4 14.667 9.6 27.2 9.6 4.533 0 8.533-.4 12-1.2 3.467-.8 6.533-1.334 9.2-1.6 3.2-.267 5.867.733 8 3 2.133 2.266 3.2 6.866 3.2 13.8 0 5.333-.867 10.066-2.6 14.2-1.733 4.133-4.867 7-9.4 8.6-3.467 1.066-8 2.066-13.6 3-5.6.933-10.533 1.4-14.8 1.4Zm308.4-.8c-17.067 0-25.6-8.534-25.6-25.6v-151.2c0-16.8 8.133-25.2 24.4-25.2s24.4 8.4 24.4 25.2v12.4c9.6-22.934 30.133-35.734 61.6-38.4 11.467-1.334 17.867 5.2 19.2 19.6 1.333 14.133-5.6 22-20.8 23.6l-8.8.8c-32.8 3.2-49.2 20-49.2 50.4v82.8c0 17.066-8.4 25.6-25.2 25.6Zm-607.2 0c-16.533 0-24.8-8.534-24.8-25.6v-151.2c0-16.8 8.133-25.2 24.4-25.2s24.4 8.4 24.4 25.2v8.4c6.667-11.2 15.667-19.734 27-25.6 11.333-5.867 24.067-8.8 38.2-8.8 46.133 0 69.2 26.8 69.2 80.4v96.8c0 17.066-8.267 25.6-24.8 25.6-16.8 0-25.2-8.534-25.2-25.6v-94.4c0-15.2-2.867-26.267-8.6-33.2-5.733-6.934-14.6-10.4-26.6-10.4-14.667 0-26.333 4.6-35 13.8-8.667 9.2-13 21.4-13 36.6v87.6c0 17.066-8.4 25.6-25.2 25.6Zm-566.8 0c-16.533 0-24.8-8.534-24.8-25.6v-151.2c0-16.8 8.133-25.2 24.4-25.2s24.4 8.4 24.4 25.2v8c5.867-10.667 14-19 24.4-25 10.4-6 22.4-9 36-9 29.333 0 48.533 12.8 57.6 38.4 6.133-12 14.933-21.4 26.4-28.2 11.467-6.8 24.533-10.2 39.2-10.2 44 0 66 26.8 66 80.4v96.8c0 17.066-8.4 25.6-25.2 25.6-16.533 0-24.8-8.534-24.8-25.6v-94.8c0-14.934-2.467-25.867-7.4-32.8-4.933-6.934-13.267-10.4-25-10.4-13.067 0-23.333 4.6-30.8 13.8-7.467 9.2-11.2 21.933-11.2 38.2v86c0 17.066-8.267 25.6-24.8 25.6-16.8 0-25.2-8.534-25.2-25.6v-94.8c0-14.934-2.467-25.867-7.4-32.8-4.933-6.934-13.133-10.4-24.6-10.4-13.067 0-23.333 4.6-30.8 13.8-7.467 9.2-11.2 21.933-11.2 38.2v86c0 17.066-8.4 25.6-25.2 25.6Zm-574.8-3.2c-18.133 0-27.2-9.067-27.2-27.2v-227.6c0-18.134 9.067-27.2 27.2-27.2h142.8c13.867 0 20.8 6.666 20.8 20 0 13.866-6.933 20.8-20.8 20.8H842.5v77.6h112c13.867 0 20.8 6.8 20.8 20.4 0 13.6-6.933 20.4-20.8 20.4h-112v82h120.8c13.867 0 20.8 6.8 20.8 20.4 0 13.6-6.933 20.4-20.8 20.4H820.5Zm1579.2-30.4c13.067 0 23.933-4.534 32.6-13.6 8.667-9.067 13-20.534 13-34.4v-8.8h-13.6c-25.067 0-42.467 1.933-52.2 5.8-9.733 3.866-14.6 10.866-14.6 21 0 8.8 3.067 16 9.2 21.6 6.133 5.6 14.667 8.4 25.6 8.4Zm-1157.6-135.2c-14.667 0-26.533 4.533-35.6 13.6-9.067 9.066-14.533 21.333-16.4 36.8h98.4c-1.067-16.267-5.533-28.734-13.4-37.4-7.867-8.667-18.867-13-33-13Zm567.6 0c-14.667 0-26.533 4.533-35.6 13.6-9.067 9.066-14.533 21.333-16.4 36.8h98.4c-1.067-16.267-5.533-28.734-13.4-37.4-7.867-8.667-18.867-13-33-13Z"
//       style={{
//         fill: "currentColor",
//         fillRule: "nonzero",
//       }}
//     />
//     <path
//       d="M633.333 302.591 487.5 555.181H195.833L50 302.591 195.833 50H487.5l145.833 252.591Z"
//       style={{
//         fill: "none",
//         stroke: "#fff",
//         strokeWidth: 100,
//       }}
//     />
//     <path
//       d="M341.667 302.591 487.5 50H195.833L50 302.591l145.833 252.59H487.5"
//       style={{
//         fill: "#fff",
//       }}
//     />
//     <path
//       d="M341.667 302.591 487.5 555.181l145.833-252.59L487.5 50H195.833L50 302.591h291.667Z"
//       style={{
//         fill: "#fbcfe8",
//       }}
//     />
//     <path
//       d="M341.667 302.591H50L195.833 50H487.5l145.833 252.591L487.5 555.181l-145.833-252.59"
//       style={{
//         fill: "none",
//         stroke: "#e5e7eb",
//         strokeWidth: "66.67px",
//       }}
//     />
//     <path
//       d="M341.667 302.591 487.5 50H195.833L50 302.591l145.833 252.59H487.5"
//       style={{
//         fill: "none",
//         stroke: "#111827",
//         strokeWidth: "66.67px",
//       }}
//     />
//   </svg>
// );

function fetchAudioBuffer(url) {
  console.log('fetching audio buffer', url);
  globalThis.__postNativeMessage__("updateSharedResourceMap", {
    "path": "sample0",
    url
  });

  globalThis.__postNativeMessage__("updateSharedResourceMap", {
    "path": "sample1",
    url
  });
}

function ErrorAlert({message, reset}) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={reset}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// The interface of our plugin, exported here as a React.js function
// component.
//
// We use the `props.requestParamValueUpdate` callback provided by the parent
// component to propagate new parameter values to the host.
export default function Interface(props) {
  const colorProps = {
    meterColor: '#EC4899',
    knobColor: '#64748B',
    thumbColor: '#F8FAFC',
  };

  let params = manifest.parameters.map(({paramId, name, min, max, defaultValue}) => {
    let currentValue = props[paramId] || 0;

    return {
      paramId,
      name,
      value: currentValue,
      readout: `${Math.round(currentValue * 100)}%`,
      setValue: (v) => props.requestParamValueUpdate(paramId, v),
    };
  });

    return (
      <div>
        <Header>Exploring evolution runs</Header>
        <Card.Group>
          <Card fluid color="teal">
              <Card.Content>
                <Card.Header>Run 1</Card.Header>
                <Card.Meta>Created in 2015</Card.Meta>
                <Card.Description>
                  <div>
                    <Button circular icon='minus' />
                    <Slider
                        value={5}
                        step={1}
                        min={1}
                        max={10}
                        style={{marginLeft: 10, marginRight: 10, marginTop: 10}}
                        handleStyle={{ width: 27, height: 27, marginTop: -11 }}
                    />
                    <Button circular icon='plus' />
                  </div>
                </Card.Description>
              </Card.Content>
          </Card>
          <Card fluid color="teal">
              <Card.Content>
                <Card.Header>Run 1</Card.Header>
                <Card.Meta>Created in 2015</Card.Meta>
                <Card.Description>
                  <p>Fetch audio</p>
                  <Button icon size='massive' color={'green'}
                    onClick={() => fetchAudioBuffer('http://localhost:8000/Steam_44K.wav')}
                  >
                    <Icon name='play' />
                  </Button>
                </Card.Description>
              </Card.Content>
          </Card>
        </Card.Group>
      </div>
    );

  // return (
  //   <div className="w-full h-screen min-w-[492px] min-h-[238px] bg-slate-800 bg-mesh p-8">
  //     <div className="h-1/5 flex justify-between items-center text-md text-slate-400 select-none">
  //       {/* <Logo className="h-8 w-auto text-slate-100" /> */}
  //       <div>
  //         <span className="font-bold">KRME</span> &middot; {__BUILD_DATE__} &middot; {__COMMIT_HASH__}
  //       </div>
  //     </div>
  //     <div className="flex flex-col h-4/5">
  //       {props.error && (<ErrorAlert message={props.error.message} reset={props.resetErrorState} />)}
  //       <div className="flex flex-1">
        
  //         {/* 
  //         {params.map(({name, value, readout, setValue}) => (
  //           <div key={name} className="flex flex-col flex-1 justify-center items-center">
  //             <Knob className="h-20 w-20 m-4" value={value} onChange={setValue} {...colorProps} />
  //             <div className="flex-initial mt-2">
  //               <div className="text-sm text-slate-50 text-center font-light">{name}</div>
  //               <div className="text-sm text-pink-500 text-center font-light">{readout}</div>
  //             </div>
  //           </div>
  //         ))}
  //         */}
  //       </div>
  //     </div>
  //   </div>
  // );
}
