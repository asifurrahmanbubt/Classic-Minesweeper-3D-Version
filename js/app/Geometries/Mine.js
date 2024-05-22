/*global define */
define(['three'], function (THREE) {
    "use strict";
    const MineGeometry = function MineGeometry(size) {//radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength
        const scope = this;

        const materials = {
            sphere: new THREE.MeshLambertMaterial({
                color: 0x000000
            }),
            spikes: new THREE.MeshLambertMaterial({
                color: 0x555555
            })
        };

        const geometries = {
            sphere: new THREE.SphereGeometry(size / 4),
            spikes: new THREE.CylinderGeometry(0.1, 2, size / 2)
        };

        const meshes = {
            sphere: new THREE.Mesh(geometries.sphere, materials.sphere)
        };

        const initSpikes = function initSpikes() {
            meshes.spikes = [
                new THREE.Mesh(geometries.spikes, materials.spikes),
                new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                new THREE.Mesh(geometries.spikes.clone(), materials.spikes)
            ];
            scope.add(meshes.spikes[0].translateY(2));
            scope.add(meshes.spikes[1].rotateZ(Math.PI).translateY(2));
            scope.add(meshes.spikes[2].rotateZ(Math.PI / 2).translateY(2));
            scope.add(meshes.spikes[3].rotateZ(-Math.PI / 2).translateY(2));
            scope.add(meshes.spikes[4].rotateZ(Math.PI).rotateX(Math.PI / 2).translateY(2));
            scope.add(meshes.spikes[5].rotateZ(Math.PI).rotateX(-Math.PI / 2).translateY(2));
        };

        THREE.Object3D.apply(this, arguments);
        this.type = 'MineGeometry';
        initSpikes();
        this.add(meshes.sphere);
    };

    THREE.MineGeometry = MineGeometry;
    THREE.MineGeometry.prototype = Object.create(THREE.Object3D.prototype);
    THREE.MineGeometry.prototype.constructor = THREE.Object3D;

    return MineGeometry;
});