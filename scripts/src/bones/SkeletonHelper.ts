class SkeletonHelper {
    public static getSkeletonAnimationRange(skeleton: BABYLON.Skeleton): BABYLON.Vector2 {
        if (skeleton) {
            let bones = skeleton.bones;
            if (bones && bones.length > 0) {
                let startFrame = Number.MAX_VALUE, endFrame = Number.MIN_VALUE;
                for (let i = 0, nBones = skeleton.bones.length; i < nBones; ++i) {
                    let anim = skeleton.bones[i].animations[0];
                    if (anim) {
                        let keys = anim.getKeys();
                        for (let keyIdx = 0, nKeys = keys.length; keyIdx < nKeys; ++keyIdx) {
                            let frame = keys[keyIdx].frame;
                            if (startFrame > frame) startFrame = frame;
                            if (endFrame < frame) endFrame = frame;
                        }
                    }
                }

                return new BABYLON.Vector2(startFrame, endFrame);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public static boneAppendAnimation(dest: BABYLON.Bone, source: BABYLON.Bone, range: BABYLON.Vector2, frameOffset: number, rescaleAsRequired = false, skelDimensionsRatio: BABYLON.Nullable<BABYLON.Vector3> = null): void {
        if (dest.animations.length === 0) {
            dest.animations.push(new BABYLON.Animation(dest.name, "_matrix", source.animations[0].framePerSecond, BABYLON.Animation.ANIMATIONTYPE_MATRIX, 0));
            dest.animations[0].setKeys([]);
        }

        let from = range.x;
        let to = range.y;
        let sourceKeys = source.animations[0].getKeys();

        // rescaling prep
        let sourceBoneLength = source.length;
        let sourceParent = source.getParent();
        let parent = dest.getParent();
        let parentScalingReqd = rescaleAsRequired && sourceParent && sourceBoneLength && this.length && sourceBoneLength !== this.length;
        let parentRatio = parentScalingReqd && parent && sourceParent ? parent.length / sourceParent.length : 1;

        let dimensionsScalingReqd = rescaleAsRequired && !parent && skelDimensionsRatio && (skelDimensionsRatio.x !== 1 || skelDimensionsRatio.y !== 1 || skelDimensionsRatio.z !== 1);

        let destKeys = dest.animations[0].getKeys();

        // loop vars declaration
        let orig: { frame: number, value: BABYLON.Matrix };
        let origTranslation: BABYLON.Vector3;
        let mat: BABYLON.Matrix;

        for (let key = 0, nKeys = sourceKeys.length; key < nKeys; key++) {
            orig = sourceKeys[key];
            if (orig.frame >= from && orig.frame <= to) {
                if (rescaleAsRequired) {
                    mat = orig.value.clone();

                    // scale based on parent ratio, when bone has parent
                    if (parentScalingReqd) {
                        origTranslation = mat.getTranslation();
                        mat.setTranslation(origTranslation.scaleInPlace(parentRatio));

                        // scale based on skeleton dimension ratio when root bone, and value is passed
                    } else if (dimensionsScalingReqd && skelDimensionsRatio) {
                        origTranslation = mat.getTranslation();
                        mat.setTranslation(origTranslation.multiplyInPlace(skelDimensionsRatio));

                        // use original when root bone, and no data for skelDimensionsRatio
                    } else {
                        mat = orig.value;
                    }
                } else {
                    mat = orig.value;
                }
                destKeys.push({ frame: orig.frame + frameOffset, value: mat });
            }
        }
    }

    public static skeletonAppendAnimation(dest: BABYLON.Skeleton, src: BABYLON.Skeleton, rescaleAsRequired: boolean = false): BABYLON.Vector2 {
        let destRange = SkeletonHelper.getSkeletonAnimationRange(dest);
        let srcRange = SkeletonHelper.getSkeletonAnimationRange(src);
        let frameOffset = destRange ? destRange.y + 1 : 0;

        let destBoneDict: { [key: string]: BABYLON.Bone } = {};
        let destBones = dest.bones;
        let srcBones = src.bones;
        for (let i = 0, nBones = destBones.length; i < nBones; ++i) {
            destBoneDict[destBones[i].name] = destBones[i];
        }

        let skelDimensionsRatio = (rescaleAsRequired && dest.dimensionsAtRest && src.dimensionsAtRest) ? dest.dimensionsAtRest.divide(src.dimensionsAtRest) : null;

        let directAppendBone = (ref: BABYLON.Bone, parent: BABYLON.Bone) => {
            let bone = new BABYLON.Bone(ref.name, dest, parent, ref.getLocalMatrix(), ref.getRestPose(), ref.getBaseMatrix());
            destBoneDict[bone.name] = bone;
            return bone;
        };

        let appendBone = (ref: BABYLON.Bone): BABYLON.Bone => {
            let parent = ref.getParent();
            if (parent) {
                let findBone = destBoneDict[parent.name];
                if (findBone) {
                    return directAppendBone(ref, findBone);
                } else {
                    return directAppendBone(ref, appendBone(parent));
                }
            } else {
                return directAppendBone(ref, null);
            }
        };

        for (let i = 0, nBones = srcBones.length; i < nBones; ++i) {
            let srcBone = srcBones[i];
            let destBone = destBoneDict[srcBone.name];
            if (!destBone) destBone = appendBone(srcBone);
            if (srcBone.animations.length > 0) SkeletonHelper.boneAppendAnimation(destBone, srcBone, srcRange, frameOffset, rescaleAsRequired, skelDimensionsRatio);
        }
        
        srcRange.x += frameOffset;
        srcRange.y += frameOffset;

        return srcRange;
    }
}