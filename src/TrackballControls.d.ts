/// <reference path="./Three.d.ts" />

declare namespace THREE
{
    class TrackballControls extends THREE.EventDispatcher
    {
        constructor(camera: THREE.Camera, element: HTMLElement);

        rotateSpeed : number;
        zoomSpeed : number;

        update : () => void;
        reset  : () => void;

        target : THREE.Vector3;
    }
}
