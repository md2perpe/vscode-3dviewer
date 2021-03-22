/// <reference path="./Three.d.ts" />

declare namespace THREE
{
    class STLLoader
    {
        load(
            uri: string,
            resolve: (_: THREE.BufferGeometry) => void,
            progress: any,
            reject: any,
        ): void;
    }
}