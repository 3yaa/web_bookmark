(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/ui/LightRays.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$core$2f$Renderer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ogl/src/core/Renderer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$core$2f$Program$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ogl/src/core/Program.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$extras$2f$Triangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ogl/src/extras/Triangle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$core$2f$Mesh$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ogl/src/core/Mesh.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const DEFAULT_COLOR = "#ffffff";
const hexToRgb = (hex)=>{
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255
    ] : [
        1,
        1,
        1
    ];
};
const getAnchorAndDir = (origin, w, h)=>{
    const outside = 0.2;
    switch(origin){
        case "top-left":
            return {
                anchor: [
                    0,
                    -outside * h
                ],
                dir: [
                    0,
                    1
                ]
            };
        case "top-right":
            return {
                anchor: [
                    w,
                    -outside * h
                ],
                dir: [
                    0,
                    1
                ]
            };
        case "left":
            return {
                anchor: [
                    -outside * w,
                    0.5 * h
                ],
                dir: [
                    1,
                    0
                ]
            };
        case "right":
            return {
                anchor: [
                    (1 + outside) * w,
                    0.5 * h
                ],
                dir: [
                    -1,
                    0
                ]
            };
        case "bottom-left":
            return {
                anchor: [
                    0,
                    (1 + outside) * h
                ],
                dir: [
                    0,
                    -1
                ]
            };
        case "bottom-center":
            return {
                anchor: [
                    0.5 * w,
                    (1 + outside) * h
                ],
                dir: [
                    0,
                    -1
                ]
            };
        case "bottom-right":
            return {
                anchor: [
                    w,
                    (1 + outside) * h
                ],
                dir: [
                    0,
                    -1
                ]
            };
        default:
            return {
                anchor: [
                    0.5 * w,
                    -outside * h
                ],
                dir: [
                    0,
                    1
                ]
            };
    }
};
const LightRays = (param)=>{
    let { raysOrigin = "top-center", raysColor = DEFAULT_COLOR, raysSpeed = 1, lightSpread = 1, rayLength = 2, pulsating = false, fadeDistance = 1.0, saturation = 1.0, followMouse = true, mouseInfluence = 0.1, noiseAmount = 0.0, distortion = 0.0, className = "" } = param;
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const uniformsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rendererRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mouseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0.5,
        y: 0.5
    });
    const smoothMouseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0.5,
        y: 0.5
    });
    const animationIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const meshRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const cleanupFunctionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const observerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LightRays.useEffect": ()=>{
            if (!containerRef.current) return;
            observerRef.current = new IntersectionObserver({
                "LightRays.useEffect": (entries)=>{
                    const entry = entries[0];
                    setIsVisible(entry.isIntersecting);
                }
            }["LightRays.useEffect"], {
                threshold: 0.1
            });
            observerRef.current.observe(containerRef.current);
            return ({
                "LightRays.useEffect": ()=>{
                    if (observerRef.current) {
                        observerRef.current.disconnect();
                        observerRef.current = null;
                    }
                }
            })["LightRays.useEffect"];
        }
    }["LightRays.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LightRays.useEffect": ()=>{
            if (!isVisible || !containerRef.current) return;
            if (cleanupFunctionRef.current) {
                cleanupFunctionRef.current();
                cleanupFunctionRef.current = null;
            }
            const initializeWebGL = {
                "LightRays.useEffect.initializeWebGL": async ()=>{
                    if (!containerRef.current) return;
                    await new Promise({
                        "LightRays.useEffect.initializeWebGL": (resolve)=>setTimeout(resolve, 10)
                    }["LightRays.useEffect.initializeWebGL"]);
                    if (!containerRef.current) return;
                    const renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$core$2f$Renderer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Renderer"]({
                        dpr: Math.min(window.devicePixelRatio, 2),
                        alpha: true
                    });
                    rendererRef.current = renderer;
                    const gl = renderer.gl;
                    gl.canvas.style.width = "100%";
                    gl.canvas.style.height = "100%";
                    while(containerRef.current.firstChild){
                        containerRef.current.removeChild(containerRef.current.firstChild);
                    }
                    containerRef.current.appendChild(gl.canvas);
                    const vert = "\nattribute vec2 position;\nvarying vec2 vUv;\nvoid main() {\n  vUv = position * 0.5 + 0.5;\n  gl_Position = vec4(position, 0.0, 1.0);\n}";
                    const frag = "precision highp float;\n\nuniform float iTime;\nuniform vec2  iResolution;\n\nuniform vec2  rayPos;\nuniform vec2  rayDir;\nuniform vec3  raysColor;\nuniform float raysSpeed;\nuniform float lightSpread;\nuniform float rayLength;\nuniform float pulsating;\nuniform float fadeDistance;\nuniform float saturation;\nuniform vec2  mousePos;\nuniform float mouseInfluence;\nuniform float noiseAmount;\nuniform float distortion;\n\nvarying vec2 vUv;\n\nfloat noise(vec2 st) {\n  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);\n}\n\nfloat rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,\n                  float seedA, float seedB, float speed) {\n  vec2 sourceToCoord = coord - raySource;\n  vec2 dirNorm = normalize(sourceToCoord);\n  float cosAngle = dot(dirNorm, rayRefDirection);\n\n  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;\n  \n  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));\n\n  float distance = length(sourceToCoord);\n  float maxDistance = iResolution.x * rayLength;\n  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);\n  \n  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);\n  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;\n\n  float baseStrength = clamp(\n    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +\n    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),\n    0.0, 1.0\n  );\n\n  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);\n  \n  vec2 finalRayDir = rayDir;\n  if (mouseInfluence > 0.0) {\n    vec2 mouseScreenPos = mousePos * iResolution.xy;\n    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);\n    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));\n  }\n\n  vec4 rays1 = vec4(1.0) *\n               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,\n                           1.5 * raysSpeed);\n  vec4 rays2 = vec4(1.0) *\n               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,\n                           1.1 * raysSpeed);\n\n  fragColor = rays1 * 0.5 + rays2 * 0.4;\n\n  if (noiseAmount > 0.0) {\n    float n = noise(coord * 0.01 + iTime * 0.1);\n    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);\n  }\n\n  float brightness = 1.0 - (coord.y / iResolution.y);\n  fragColor.x *= 0.1 + brightness * 0.8;\n  fragColor.y *= 0.3 + brightness * 0.6;\n  fragColor.z *= 0.5 + brightness * 0.5;\n\n  if (saturation != 1.0) {\n    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));\n    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);\n  }\n\n  fragColor.rgb *= raysColor;\n}\n\nvoid main() {\n  vec4 color;\n  mainImage(color, gl_FragCoord.xy);\n  gl_FragColor  = color;\n}";
                    const uniforms = {
                        iTime: {
                            value: 0
                        },
                        iResolution: {
                            value: [
                                1,
                                1
                            ]
                        },
                        rayPos: {
                            value: [
                                0,
                                0
                            ]
                        },
                        rayDir: {
                            value: [
                                0,
                                1
                            ]
                        },
                        raysColor: {
                            value: hexToRgb(raysColor)
                        },
                        raysSpeed: {
                            value: raysSpeed
                        },
                        lightSpread: {
                            value: lightSpread
                        },
                        rayLength: {
                            value: rayLength
                        },
                        pulsating: {
                            value: pulsating ? 1.0 : 0.0
                        },
                        fadeDistance: {
                            value: fadeDistance
                        },
                        saturation: {
                            value: saturation
                        },
                        mousePos: {
                            value: [
                                0.5,
                                0.5
                            ]
                        },
                        mouseInfluence: {
                            value: mouseInfluence
                        },
                        noiseAmount: {
                            value: noiseAmount
                        },
                        distortion: {
                            value: distortion
                        }
                    };
                    uniformsRef.current = uniforms;
                    const geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$extras$2f$Triangle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Triangle"](gl);
                    const program = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$core$2f$Program$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"](gl, {
                        vertex: vert,
                        fragment: frag,
                        uniforms
                    });
                    const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ogl$2f$src$2f$core$2f$Mesh$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](gl, {
                        geometry,
                        program
                    });
                    meshRef.current = mesh;
                    const updatePlacement = {
                        "LightRays.useEffect.initializeWebGL.updatePlacement": ()=>{
                            if (!containerRef.current || !renderer) return;
                            renderer.dpr = Math.min(window.devicePixelRatio, 2);
                            const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
                            renderer.setSize(wCSS, hCSS);
                            const dpr = renderer.dpr;
                            const w = wCSS * dpr;
                            const h = hCSS * dpr;
                            uniforms.iResolution.value = [
                                w,
                                h
                            ];
                            const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
                            uniforms.rayPos.value = anchor;
                            uniforms.rayDir.value = dir;
                        }
                    }["LightRays.useEffect.initializeWebGL.updatePlacement"];
                    const loop = {
                        "LightRays.useEffect.initializeWebGL.loop": (t)=>{
                            if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
                                return;
                            }
                            uniforms.iTime.value = t * 0.001;
                            if (followMouse && mouseInfluence > 0.0) {
                                const smoothing = 0.92;
                                smoothMouseRef.current.x = smoothMouseRef.current.x * smoothing + mouseRef.current.x * (1 - smoothing);
                                smoothMouseRef.current.y = smoothMouseRef.current.y * smoothing + mouseRef.current.y * (1 - smoothing);
                                uniforms.mousePos.value = [
                                    smoothMouseRef.current.x,
                                    smoothMouseRef.current.y
                                ];
                            }
                            try {
                                renderer.render({
                                    scene: mesh
                                });
                                animationIdRef.current = requestAnimationFrame(loop);
                            } catch (error) {
                                console.warn("WebGL rendering error:", error);
                                return;
                            }
                        }
                    }["LightRays.useEffect.initializeWebGL.loop"];
                    window.addEventListener("resize", updatePlacement);
                    updatePlacement();
                    animationIdRef.current = requestAnimationFrame(loop);
                    cleanupFunctionRef.current = ({
                        "LightRays.useEffect.initializeWebGL": ()=>{
                            if (animationIdRef.current) {
                                cancelAnimationFrame(animationIdRef.current);
                                animationIdRef.current = null;
                            }
                            window.removeEventListener("resize", updatePlacement);
                            if (renderer) {
                                try {
                                    const canvas = renderer.gl.canvas;
                                    const loseContextExt = renderer.gl.getExtension("WEBGL_lose_context");
                                    if (loseContextExt) {
                                        loseContextExt.loseContext();
                                    }
                                    if (canvas && canvas.parentNode) {
                                        canvas.parentNode.removeChild(canvas);
                                    }
                                } catch (error) {
                                    console.warn("Error during WebGL cleanup:", error);
                                }
                            }
                            rendererRef.current = null;
                            uniformsRef.current = null;
                            meshRef.current = null;
                        }
                    })["LightRays.useEffect.initializeWebGL"];
                }
            }["LightRays.useEffect.initializeWebGL"];
            initializeWebGL();
            return ({
                "LightRays.useEffect": ()=>{
                    if (cleanupFunctionRef.current) {
                        cleanupFunctionRef.current();
                        cleanupFunctionRef.current = null;
                    }
                }
            })["LightRays.useEffect"];
        }
    }["LightRays.useEffect"], [
        isVisible,
        raysOrigin,
        raysColor,
        raysSpeed,
        lightSpread,
        rayLength,
        pulsating,
        fadeDistance,
        saturation,
        followMouse,
        mouseInfluence,
        noiseAmount,
        distortion
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LightRays.useEffect": ()=>{
            if (!uniformsRef.current || !containerRef.current || !rendererRef.current) return;
            const u = uniformsRef.current;
            const renderer = rendererRef.current;
            u.raysColor.value = hexToRgb(raysColor);
            u.raysSpeed.value = raysSpeed;
            u.lightSpread.value = lightSpread;
            u.rayLength.value = rayLength;
            u.pulsating.value = pulsating ? 1.0 : 0.0;
            u.fadeDistance.value = fadeDistance;
            u.saturation.value = saturation;
            u.mouseInfluence.value = mouseInfluence;
            u.noiseAmount.value = noiseAmount;
            u.distortion.value = distortion;
            const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
            const dpr = renderer.dpr;
            const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
            u.rayPos.value = anchor;
            u.rayDir.value = dir;
        }
    }["LightRays.useEffect"], [
        raysColor,
        raysSpeed,
        lightSpread,
        raysOrigin,
        rayLength,
        pulsating,
        fadeDistance,
        saturation,
        mouseInfluence,
        noiseAmount,
        distortion
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LightRays.useEffect": ()=>{
            const handleMouseMove = {
                "LightRays.useEffect.handleMouseMove": (e)=>{
                    if (!containerRef.current || !rendererRef.current) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    mouseRef.current = {
                        x,
                        y
                    };
                }
            }["LightRays.useEffect.handleMouseMove"];
            if (followMouse) {
                window.addEventListener("mousemove", handleMouseMove);
                return ({
                    "LightRays.useEffect": ()=>window.removeEventListener("mousemove", handleMouseMove)
                })["LightRays.useEffect"];
            }
        }
    }["LightRays.useEffect"], [
        followMouse
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "w-full h-full pointer-events-none z-[3] overflow-hidden relative ".concat(className).trim()
    }, void 0, false, {
        fileName: "[project]/app/components/ui/LightRays.tsx",
        lineNumber: 464,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LightRays, "gkxaG+awg9r85Ws+gbq3bog+yME=");
_c = LightRays;
const __TURBOPACK__default__export__ = LightRays;
var _c;
__turbopack_context__.k.register(_c, "LightRays");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/LandingPage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LandingPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book.js [app-client] (ecmascript) <export default as Book>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/film.js [app-client] (ecmascript) <export default as Film>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tv.js [app-client] (ecmascript) <export default as Tv>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gamepad-2.js [app-client] (ecmascript) <export default as Gamepad2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ui$2f$LightRays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ui/LightRays.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const sections = [
    {
        name: "Books",
        href: "/books",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__["Book"]
    },
    {
        name: "Movies",
        href: "/movies",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__["Film"]
    },
    {
        name: "Shows",
        href: "/shows",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__["Tv"]
    },
    {
        name: "Games",
        href: "/games",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__["Gamepad2"]
    }
];
function LandingPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "relative min-h-screen w-full flex flex-col items-center bg-black text-white overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ui$2f$LightRays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    raysOrigin: "top-center",
                    raysColor: "#ffffff",
                    raysSpeed: 0.5,
                    lightSpread: 1.2,
                    rayLength: 2,
                    // pulsating
                    fadeDistance: 0.9,
                    saturation: 1.0,
                    followMouse: true,
                    mouseInfluence: 0.15,
                    noiseAmount: 0.05,
                    distortion: 0.08,
                    className: "w-full h-full"
                }, void 0, false, {
                    fileName: "[project]/app/components/LandingPage.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/LandingPage.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].header, {
                initial: {
                    opacity: 0,
                    y: -20
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                transition: {
                    duration: 0.6
                },
                className: "relative z-10 mt-24 text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent",
                    children: "Mouthful"
                }, void 0, false, {
                    fileName: "[project]/app/components/LandingPage.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/LandingPage.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0
                },
                animate: {
                    opacity: 1
                },
                transition: {
                    delay: 0.3,
                    duration: 0.6
                },
                className: "relative z-10 mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6 w-full max-w-5xl",
                children: sections.map((section, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: section.href,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                scale: 0.95
                            },
                            animate: {
                                opacity: 1,
                                scale: 1
                            },
                            transition: {
                                delay: i * 0.1
                            },
                            whileHover: {
                                scale: 1.06,
                                rotate: 0.5
                            },
                            className: "group relative aspect-[2/3] rounded-2xl border border-zinc-800/70  bg-zinc-900/40 backdrop-blur-xl shadow-[0_0_20px_-8px_rgba(0,0,0,0.7)]  flex flex-col items-center justify-center cursor-pointer  overflow-hidden transition-all duration-300",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(section.icon, {
                                    className: "w-12 h-12 text-zinc-400 group-hover:text-white transition-colors duration-300"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/LandingPage.tsx",
                                    lineNumber: 68,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mt-4 text-lg font-medium text-zinc-300 group-hover:text-white transition-colors",
                                    children: section.name
                                }, void 0, false, {
                                    fileName: "[project]/app/components/LandingPage.tsx",
                                    lineNumber: 69,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 transition-colors duration-300"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/LandingPage.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/5 to-transparent transition-opacity duration-300"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/LandingPage.tsx",
                                    lineNumber: 74,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/LandingPage.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this)
                    }, section.name, false, {
                        fileName: "[project]/app/components/LandingPage.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/components/LandingPage.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "absolute z-10 bottom-4 text-zinc-600 text-sm tracking-wide",
                children: [
                    "© ",
                    new Date().getFullYear(),
                    " Mouthful"
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/LandingPage.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/LandingPage.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = LandingPage;
var _c;
__turbopack_context__.k.register(_c, "LandingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_components_c0e57835._.js.map