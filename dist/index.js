// src/button/Button.tsx
import { forwardRef as forwardRef2 } from "react";

// styled-system/jsx/factory.mjs
import { createElement, forwardRef, useMemo } from "react";

// styled-system/helpers.mjs
function isObject(value) {
  return typeof value === "object" && value != null && !Array.isArray(value);
}
var isObjectOrArray = (obj) => typeof obj === "object" && obj !== null;
function compact(value) {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([_, value2]) => value2 !== void 0));
}
var isBaseCondition = (v) => v === "base";
function filterBaseConditions(c) {
  return c.slice().filter((v) => !isBaseCondition(v));
}
function toChar(code) {
  return String.fromCharCode(code + (code > 25 ? 39 : 97));
}
function toName(code) {
  let name = "";
  let x;
  for (x = Math.abs(code); x > 52; x = x / 52 | 0) name = toChar(x % 52) + name;
  return toChar(x % 52) + name;
}
function toPhash(h, x) {
  let i = x.length;
  while (i) h = h * 33 ^ x.charCodeAt(--i);
  return h;
}
function toHash(value) {
  return toName(toPhash(5381, value) >>> 0);
}
var importantRegex = /\s*!(important)?/i;
function isImportant(value) {
  return typeof value === "string" ? importantRegex.test(value) : false;
}
function withoutImportant(value) {
  return typeof value === "string" ? value.replace(importantRegex, "").trim() : value;
}
function withoutSpace(str) {
  return typeof str === "string" ? str.replaceAll(" ", "_") : str;
}
var memo = (fn) => {
  const cache = /* @__PURE__ */ new Map();
  const get = (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
  return get;
};
var MERGE_OMIT = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function mergeProps(...sources) {
  return sources.reduce((prev, obj) => {
    if (!obj) return prev;
    Object.keys(obj).forEach((key) => {
      if (MERGE_OMIT.has(key)) return;
      const prevValue = prev[key];
      const value = obj[key];
      if (isObject(prevValue) && isObject(value)) {
        prev[key] = mergeProps(prevValue, value);
      } else {
        prev[key] = value;
      }
    });
    return prev;
  }, {});
}
var isNotNullish = (element) => element != null;
function walkObject(target, predicate, options = {}) {
  const { stop, getKey } = options;
  function inner(value, path = []) {
    if (isObjectOrArray(value)) {
      const result = {};
      for (const [prop, child] of Object.entries(value)) {
        const key = getKey?.(prop, child) ?? prop;
        const childPath = [...path, key];
        if (stop?.(value, childPath)) {
          return predicate(value, path);
        }
        const next = inner(child, childPath);
        if (isNotNullish(next)) {
          result[key] = next;
        }
      }
      return result;
    }
    return predicate(value, path);
  }
  return inner(target);
}
function mapObject(obj, fn) {
  if (Array.isArray(obj)) return obj.map((value) => fn(value));
  if (!isObject(obj)) return fn(obj);
  return walkObject(obj, (value) => fn(value));
}
function toResponsiveObject(values, breakpoints) {
  return values.reduce(
    (acc, current, index) => {
      const key = breakpoints[index];
      if (current != null) {
        acc[key] = current;
      }
      return acc;
    },
    {}
  );
}
function normalizeStyleObject(styles, context2, shorthand = true) {
  const { utility, conditions: conditions2 } = context2;
  const { hasShorthand, resolveShorthand: resolveShorthand2 } = utility;
  return walkObject(
    styles,
    (value) => {
      return Array.isArray(value) ? toResponsiveObject(value, conditions2.breakpoints.keys) : value;
    },
    {
      stop: (value) => Array.isArray(value),
      getKey: shorthand ? (prop) => hasShorthand ? resolveShorthand2(prop) : prop : void 0
    }
  );
}
var fallbackCondition = {
  shift: (v) => v,
  finalize: (v) => v,
  breakpoints: { keys: [] }
};
var sanitize = (value) => typeof value === "string" ? value.replaceAll(/[\n\s]+/g, " ") : value;
function createCss(context2) {
  const { utility, hash, conditions: conds = fallbackCondition } = context2;
  const formatClassName = (str) => [utility.prefix, str].filter(Boolean).join("-");
  const hashFn = (conditions2, className) => {
    let result;
    if (hash) {
      const baseArray = [...conds.finalize(conditions2), className];
      result = formatClassName(utility.toHash(baseArray, toHash));
    } else {
      const baseArray = [...conds.finalize(conditions2), formatClassName(className)];
      result = baseArray.join(":");
    }
    return result;
  };
  return memo(({ base, ...styles } = {}) => {
    const styleObject = Object.assign(styles, base);
    const normalizedObject = normalizeStyleObject(styleObject, context2);
    const classNames = /* @__PURE__ */ new Set();
    walkObject(normalizedObject, (value, paths) => {
      if (value == null) return;
      const important = isImportant(value);
      const [prop, ...allConditions] = conds.shift(paths);
      const conditions2 = filterBaseConditions(allConditions);
      const transformed = utility.transform(prop, withoutImportant(sanitize(value)));
      let className = hashFn(conditions2, transformed.className);
      if (important) className = `${className}!`;
      classNames.add(className);
    });
    return Array.from(classNames).join(" ");
  });
}
function compactStyles(...styles) {
  return styles.flat().filter((style) => isObject(style) && Object.keys(compact(style)).length > 0);
}
function createMergeCss(context2) {
  function resolve(styles) {
    const allStyles = compactStyles(...styles);
    if (allStyles.length === 1) return allStyles;
    return allStyles.map((style) => normalizeStyleObject(style, context2));
  }
  function mergeCss2(...styles) {
    return mergeProps(...resolve(styles));
  }
  function assignCss2(...styles) {
    return Object.assign({}, ...resolve(styles));
  }
  return { mergeCss: memo(mergeCss2), assignCss: assignCss2 };
}
var wordRegex = /([A-Z])/g;
var msRegex = /^ms-/;
var hypenateProperty = memo((property) => {
  if (property.startsWith("--")) return property;
  return property.replace(wordRegex, "-$1").replace(msRegex, "-ms-").toLowerCase();
});
var fns = ["min", "max", "clamp", "calc"];
var fnRegExp = new RegExp(`^(${fns.join("|")})\\(.*\\)`);
var isCssFunction = (v) => typeof v === "string" && fnRegExp.test(v);
var lengthUnits = "cm,mm,Q,in,pc,pt,px,em,ex,ch,rem,lh,rlh,vw,vh,vmin,vmax,vb,vi,svw,svh,lvw,lvh,dvw,dvh,cqw,cqh,cqi,cqb,cqmin,cqmax,%";
var lengthUnitsPattern = `(?:${lengthUnits.split(",").join("|")})`;
var lengthRegExp = new RegExp(`^[+-]?[0-9]*.?[0-9]+(?:[eE][+-]?[0-9]+)?${lengthUnitsPattern}$`);
var isCssUnit = (v) => typeof v === "string" && lengthRegExp.test(v);
var isCssVar = (v) => typeof v === "string" && /^var\(--.+\)$/.test(v);
var patternFns = {
  map: mapObject,
  isCssFunction,
  isCssVar,
  isCssUnit
};
var getPatternStyles = (pattern, styles) => {
  if (!pattern?.defaultValues) return styles;
  const defaults2 = typeof pattern.defaultValues === "function" ? pattern.defaultValues(styles) : pattern.defaultValues;
  return Object.assign({}, defaults2, compact(styles));
};
function splitProps(props, ...keys) {
  const descriptors = Object.getOwnPropertyDescriptors(props);
  const dKeys = Object.keys(descriptors);
  const split = (k) => {
    const clone = {};
    for (let i = 0; i < k.length; i++) {
      const key = k[i];
      if (descriptors[key]) {
        Object.defineProperty(clone, key, descriptors[key]);
        delete descriptors[key];
      }
    }
    return clone;
  };
  const fn = (key) => split(Array.isArray(key) ? key : dKeys.filter(key));
  return keys.map(fn).concat(split(dKeys));
}
var uniq = (...items) => {
  const set = items.reduce((acc, currItems) => {
    if (currItems) {
      currItems.forEach((item) => acc.add(item));
    }
    return acc;
  }, /* @__PURE__ */ new Set([]));
  return Array.from(set);
};
var htmlProps = ["htmlSize", "htmlTranslate", "htmlWidth", "htmlHeight"];
function convert(key) {
  return htmlProps.includes(key) ? key.replace("html", "").toLowerCase() : key;
}
function normalizeHTMLProps(props) {
  return Object.fromEntries(Object.entries(props).map(([key, value]) => [convert(key), value]));
}
normalizeHTMLProps.keys = htmlProps;

// styled-system/css/conditions.mjs
var conditionsStr = "_hover,_focus,_focusWithin,_focusVisible,_disabled,_active,_visited,_target,_readOnly,_readWrite,_empty,_checked,_enabled,_expanded,_highlighted,_complete,_incomplete,_dragging,_before,_after,_firstLetter,_firstLine,_marker,_selection,_file,_backdrop,_first,_last,_only,_even,_odd,_firstOfType,_lastOfType,_onlyOfType,_peerFocus,_peerHover,_peerActive,_peerFocusWithin,_peerFocusVisible,_peerDisabled,_peerChecked,_peerInvalid,_peerExpanded,_peerPlaceholderShown,_groupFocus,_groupHover,_groupActive,_groupFocusWithin,_groupFocusVisible,_groupDisabled,_groupChecked,_groupExpanded,_groupInvalid,_indeterminate,_required,_valid,_invalid,_autofill,_inRange,_outOfRange,_placeholder,_placeholderShown,_pressed,_selected,_grabbed,_underValue,_overValue,_atValue,_default,_optional,_open,_closed,_fullscreen,_loading,_hidden,_current,_currentPage,_currentStep,_today,_unavailable,_rangeStart,_rangeEnd,_now,_topmost,_motionReduce,_motionSafe,_print,_landscape,_portrait,_dark,_light,_osDark,_osLight,_highContrast,_lessContrast,_moreContrast,_ltr,_rtl,_scrollbar,_scrollbarThumb,_scrollbarTrack,_horizontal,_vertical,_icon,_starting,_noscript,_invertedColors,sm,smOnly,smDown,md,mdOnly,mdDown,lg,lgOnly,lgDown,xl,xlOnly,xlDown,2xl,2xlOnly,2xlDown,smToMd,smToLg,smToXl,smTo2xl,mdToLg,mdToXl,mdTo2xl,lgToXl,lgTo2xl,xlTo2xl,@/xs,@/sm,@/md,@/lg,@/xl,@/2xl,@/3xl,@/4xl,@/5xl,@/6xl,@/7xl,@/8xl,base";
var conditions = new Set(conditionsStr.split(","));
var conditionRegex = /^@|&|&$/;
function isCondition(value) {
  return conditions.has(value) || conditionRegex.test(value);
}
var underscoreRegex = /^_/;
var conditionsSelectorRegex = /&|@/;
function finalizeConditions(paths) {
  return paths.map((path) => {
    if (conditions.has(path)) {
      return path.replace(underscoreRegex, "");
    }
    if (conditionsSelectorRegex.test(path)) {
      return `[${withoutSpace(path.trim())}]`;
    }
    return path;
  });
}
function sortConditions(paths) {
  return paths.sort((a, b) => {
    const aa = isCondition(a);
    const bb = isCondition(b);
    if (aa && !bb) return 1;
    if (!aa && bb) return -1;
    return 0;
  });
}

// styled-system/css/css.mjs
var utilities = "aspectRatio:asp,boxDecorationBreak:bx-db,zIndex:z,boxSizing:bx-s,objectPosition:obj-p,objectFit:obj-f,overscrollBehavior:ovs-b,overscrollBehaviorX:ovs-bx,overscrollBehaviorY:ovs-by,position:pos/1,top:top,left:left,inset:inset,insetInline:inset-x/insetX,insetBlock:inset-y/insetY,insetBlockEnd:inset-be,insetBlockStart:inset-bs,insetInlineEnd:inset-e/insetEnd/end,insetInlineStart:inset-s/insetStart/start,right:right,bottom:bottom,float:float,visibility:vis,display:d,hideFrom:hide,hideBelow:show,flexBasis:flex-b,flex:flex,flexDirection:flex-d/flexDir,flexGrow:flex-g,flexShrink:flex-sh,gridTemplateColumns:grid-tc,gridTemplateRows:grid-tr,gridColumn:grid-c,gridRow:grid-r,gridColumnStart:grid-cs,gridColumnEnd:grid-ce,gridAutoFlow:grid-af,gridAutoColumns:grid-ac,gridAutoRows:grid-ar,gap:gap,gridGap:grid-g,gridRowGap:grid-rg,gridColumnGap:grid-cg,rowGap:rg,columnGap:cg,justifyContent:jc,alignContent:ac,alignItems:ai,alignSelf:as,padding:p/1,paddingLeft:pl/1,paddingRight:pr/1,paddingTop:pt/1,paddingBottom:pb/1,paddingBlock:py/1/paddingY,paddingBlockEnd:pbe,paddingBlockStart:pbs,paddingInline:px/paddingX/1,paddingInlineEnd:pe/1/paddingEnd,paddingInlineStart:ps/1/paddingStart,marginLeft:ml/1,marginRight:mr/1,marginTop:mt/1,marginBottom:mb/1,margin:m/1,marginBlock:my/1/marginY,marginBlockEnd:mbe,marginBlockStart:mbs,marginInline:mx/1/marginX,marginInlineEnd:me/1/marginEnd,marginInlineStart:ms/1/marginStart,spaceX:sx,spaceY:sy,outlineWidth:ring-w/ringWidth,outlineColor:ring-c/ringColor,outline:ring/1,outlineOffset:ring-o/ringOffset,focusRing:focus-ring,focusVisibleRing:focus-v-ring,focusRingColor:focus-ring-c,focusRingOffset:focus-ring-o,focusRingWidth:focus-ring-w,focusRingStyle:focus-ring-s,divideX:dvd-x,divideY:dvd-y,divideColor:dvd-c,divideStyle:dvd-s,width:w/1,inlineSize:w-is,minWidth:min-w/minW,minInlineSize:min-w-is,maxWidth:max-w/maxW,maxInlineSize:max-w-is,height:h/1,blockSize:h-bs,minHeight:min-h/minH,minBlockSize:min-h-bs,maxHeight:max-h/maxH,maxBlockSize:max-b,boxSize:size,color:c,fontFamily:ff,fontSize:fs,fontSizeAdjust:fs-a,fontPalette:fp,fontKerning:fk,fontFeatureSettings:ff-s,fontWeight:fw,fontSmoothing:fsmt,fontVariant:fv,fontVariantAlternates:fv-alt,fontVariantCaps:fv-caps,fontVariationSettings:fv-s,fontVariantNumeric:fv-num,letterSpacing:ls,lineHeight:lh,textAlign:ta,textDecoration:td,textDecorationColor:td-c,textEmphasisColor:te-c,textDecorationStyle:td-s,textDecorationThickness:td-t,textUnderlineOffset:tu-o,textTransform:tt,textIndent:ti,textShadow:tsh,textShadowColor:tsh-c/textShadowColor,textOverflow:tov,verticalAlign:va,wordBreak:wb,textWrap:tw,truncate:trunc,lineClamp:lc,listStyleType:li-t,listStylePosition:li-pos,listStyleImage:li-img,listStyle:li-s,backgroundPosition:bg-p/bgPosition,backgroundPositionX:bg-p-x/bgPositionX,backgroundPositionY:bg-p-y/bgPositionY,backgroundAttachment:bg-a/bgAttachment,backgroundClip:bg-cp/bgClip,background:bg/1,backgroundColor:bg-c/bgColor,backgroundOrigin:bg-o/bgOrigin,backgroundImage:bg-i/bgImage,backgroundRepeat:bg-r/bgRepeat,backgroundBlendMode:bg-bm/bgBlendMode,backgroundSize:bg-s/bgSize,backgroundGradient:bg-grad/bgGradient,backgroundLinear:bg-linear/bgLinear,backgroundRadial:bg-radial/bgRadial,backgroundConic:bg-conic/bgConic,textGradient:txt-grad,gradientFromPosition:grad-from-pos,gradientToPosition:grad-to-pos,gradientFrom:grad-from,gradientTo:grad-to,gradientVia:grad-via,gradientViaPosition:grad-via-pos,borderRadius:bdr/rounded,borderTopLeftRadius:bdr-tl/roundedTopLeft,borderTopRightRadius:bdr-tr/roundedTopRight,borderBottomRightRadius:bdr-br/roundedBottomRight,borderBottomLeftRadius:bdr-bl/roundedBottomLeft,borderTopRadius:bdr-t/roundedTop,borderRightRadius:bdr-r/roundedRight,borderBottomRadius:bdr-b/roundedBottom,borderLeftRadius:bdr-l/roundedLeft,borderStartStartRadius:bdr-ss/roundedStartStart,borderStartEndRadius:bdr-se/roundedStartEnd,borderStartRadius:bdr-s/roundedStart,borderEndStartRadius:bdr-es/roundedEndStart,borderEndEndRadius:bdr-ee/roundedEndEnd,borderEndRadius:bdr-e/roundedEnd,border:bd,borderWidth:bd-w,borderTopWidth:bd-t-w,borderLeftWidth:bd-l-w,borderRightWidth:bd-r-w,borderBottomWidth:bd-b-w,borderBlockStartWidth:bd-bs-w,borderBlockEndWidth:bd-be-w,borderColor:bd-c,borderInline:bd-x/borderX,borderInlineWidth:bd-x-w/borderXWidth,borderInlineColor:bd-x-c/borderXColor,borderBlock:bd-y/borderY,borderBlockWidth:bd-y-w/borderYWidth,borderBlockColor:bd-y-c/borderYColor,borderLeft:bd-l,borderLeftColor:bd-l-c,borderInlineStart:bd-s/borderStart,borderInlineStartWidth:bd-s-w/borderStartWidth,borderInlineStartColor:bd-s-c/borderStartColor,borderRight:bd-r,borderRightColor:bd-r-c,borderInlineEnd:bd-e/borderEnd,borderInlineEndWidth:bd-e-w/borderEndWidth,borderInlineEndColor:bd-e-c/borderEndColor,borderTop:bd-t,borderTopColor:bd-t-c,borderBottom:bd-b,borderBottomColor:bd-b-c,borderBlockEnd:bd-be,borderBlockEndColor:bd-be-c,borderBlockStart:bd-bs,borderBlockStartColor:bd-bs-c,opacity:op,boxShadow:bx-sh/shadow,boxShadowColor:bx-sh-c/shadowColor,mixBlendMode:mix-bm,filter:filter,brightness:brightness,contrast:contrast,grayscale:grayscale,hueRotate:hue-rotate,invert:invert,saturate:saturate,sepia:sepia,dropShadow:drop-shadow,blur:blur,backdropFilter:bkdp,backdropBlur:bkdp-blur,backdropBrightness:bkdp-brightness,backdropContrast:bkdp-contrast,backdropGrayscale:bkdp-grayscale,backdropHueRotate:bkdp-hue-rotate,backdropInvert:bkdp-invert,backdropOpacity:bkdp-opacity,backdropSaturate:bkdp-saturate,backdropSepia:bkdp-sepia,borderCollapse:bd-cl,borderSpacing:bd-sp,borderSpacingX:bd-sx,borderSpacingY:bd-sy,tableLayout:tbl,transitionTimingFunction:trs-tmf,transitionDelay:trs-dly,transitionDuration:trs-dur,transitionProperty:trs-prop,transition:trs,animation:anim,animationName:anim-n,animationTimingFunction:anim-tmf,animationDuration:anim-dur,animationDelay:anim-dly,animationPlayState:anim-ps,animationComposition:anim-comp,animationFillMode:anim-fm,animationDirection:anim-dir,animationIterationCount:anim-ic,animationRange:anim-r,animationState:anim-s,animationRangeStart:anim-rs,animationRangeEnd:anim-re,animationTimeline:anim-tl,transformOrigin:trf-o,transformBox:trf-b,transformStyle:trf-s,transform:trf,rotate:rotate,rotateX:rotate-x,rotateY:rotate-y,rotateZ:rotate-z,scale:scale,scaleX:scale-x,scaleY:scale-y,translate:translate,translateX:translate-x/x,translateY:translate-y/y,translateZ:translate-z/z,accentColor:ac-c,caretColor:ca-c,scrollBehavior:scr-bhv,scrollbar:scr-bar,scrollbarColor:scr-bar-c,scrollbarGutter:scr-bar-g,scrollbarWidth:scr-bar-w,scrollMargin:scr-m,scrollMarginLeft:scr-ml,scrollMarginRight:scr-mr,scrollMarginTop:scr-mt,scrollMarginBottom:scr-mb,scrollMarginBlock:scr-my/scrollMarginY,scrollMarginBlockEnd:scr-mbe,scrollMarginBlockStart:scr-mbt,scrollMarginInline:scr-mx/scrollMarginX,scrollMarginInlineEnd:scr-me,scrollMarginInlineStart:scr-ms,scrollPadding:scr-p,scrollPaddingBlock:scr-py/scrollPaddingY,scrollPaddingBlockStart:scr-pbs,scrollPaddingBlockEnd:scr-pbe,scrollPaddingInline:scr-px/scrollPaddingX,scrollPaddingInlineEnd:scr-pe,scrollPaddingInlineStart:scr-ps,scrollPaddingLeft:scr-pl,scrollPaddingRight:scr-pr,scrollPaddingTop:scr-pt,scrollPaddingBottom:scr-pb,scrollSnapAlign:scr-sa,scrollSnapStop:scrs-s,scrollSnapType:scrs-t,scrollSnapStrictness:scrs-strt,scrollSnapMargin:scrs-m,scrollSnapMarginTop:scrs-mt,scrollSnapMarginBottom:scrs-mb,scrollSnapMarginLeft:scrs-ml,scrollSnapMarginRight:scrs-mr,scrollSnapCoordinate:scrs-c,scrollSnapDestination:scrs-d,scrollSnapPointsX:scrs-px,scrollSnapPointsY:scrs-py,scrollSnapTypeX:scrs-tx,scrollSnapTypeY:scrs-ty,scrollTimeline:scrtl,scrollTimelineAxis:scrtl-a,scrollTimelineName:scrtl-n,touchAction:tch-a,userSelect:us,overflow:ov,overflowWrap:ov-wrap,overflowX:ov-x,overflowY:ov-y,overflowAnchor:ov-a,overflowBlock:ov-b,overflowInline:ov-i,overflowClipBox:ovcp-bx,overflowClipMargin:ovcp-m,overscrollBehaviorBlock:ovs-bb,overscrollBehaviorInline:ovs-bi,fill:fill,stroke:stk,strokeWidth:stk-w,strokeDasharray:stk-dsh,strokeDashoffset:stk-do,strokeLinecap:stk-lc,strokeLinejoin:stk-lj,strokeMiterlimit:stk-ml,strokeOpacity:stk-op,srOnly:sr,debug:debug,appearance:ap,backfaceVisibility:bfv,clipPath:cp-path,hyphens:hy,mask:msk,maskImage:msk-i,maskSize:msk-s,textSizeAdjust:txt-adj,container:cq,containerName:cq-n,containerType:cq-t,cursor:cursor,textStyle:textStyle";
var classNameByProp = /* @__PURE__ */ new Map();
var shorthands = /* @__PURE__ */ new Map();
utilities.split(",").forEach((utility) => {
  const [prop, meta] = utility.split(":");
  const [className, ...shorthandList] = meta.split("/");
  classNameByProp.set(prop, className);
  if (shorthandList.length) {
    shorthandList.forEach((shorthand) => {
      shorthands.set(shorthand === "1" ? className : shorthand, prop);
    });
  }
});
var resolveShorthand = (prop) => shorthands.get(prop) || prop;
var context = {
  conditions: {
    shift: sortConditions,
    finalize: finalizeConditions,
    breakpoints: { keys: ["base", "sm", "md", "lg", "xl", "2xl"] }
  },
  utility: {
    transform: (prop, value) => {
      const key = resolveShorthand(prop);
      const propKey = classNameByProp.get(key) || hypenateProperty(key);
      return { className: `${propKey}_${withoutSpace(value)}` };
    },
    hasShorthand: true,
    toHash: (path, hashFn) => hashFn(path.join(":")),
    resolveShorthand
  }
};
var cssFn = createCss(context);
var css = (...styles) => cssFn(mergeCss(...styles));
css.raw = (...styles) => mergeCss(...styles);
var { mergeCss, assignCss } = createMergeCss(context);

// styled-system/css/cx.mjs
function cx() {
  let str = "", i = 0, arg;
  for (; i < arguments.length; ) {
    if ((arg = arguments[i++]) && typeof arg === "string") {
      str && (str += " ");
      str += arg;
    }
  }
  return str;
}

// styled-system/css/cva.mjs
var defaults = (conf) => ({
  base: {},
  variants: {},
  defaultVariants: {},
  compoundVariants: [],
  ...conf
});
function cva(config) {
  const { base, variants, defaultVariants, compoundVariants } = defaults(config);
  const getVariantProps = (variants2) => ({ ...defaultVariants, ...compact(variants2) });
  function resolve(props = {}) {
    const computedVariants = getVariantProps(props);
    let variantCss = { ...base };
    for (const [key, value] of Object.entries(computedVariants)) {
      if (variants[key]?.[value]) {
        variantCss = mergeCss(variantCss, variants[key][value]);
      }
    }
    const compoundVariantCss = getCompoundVariantCss(compoundVariants, computedVariants);
    return mergeCss(variantCss, compoundVariantCss);
  }
  function merge(__cva) {
    const override = defaults(__cva.config);
    const variantKeys2 = uniq(__cva.variantKeys, Object.keys(variants));
    return cva({
      base: mergeCss(base, override.base),
      variants: Object.fromEntries(
        variantKeys2.map((key) => [key, mergeCss(variants[key], override.variants[key])])
      ),
      defaultVariants: mergeProps(defaultVariants, override.defaultVariants),
      compoundVariants: [...compoundVariants, ...override.compoundVariants]
    });
  }
  function cvaFn(props) {
    return css(resolve(props));
  }
  const variantKeys = Object.keys(variants);
  function splitVariantProps(props) {
    return splitProps(props, variantKeys);
  }
  const variantMap = Object.fromEntries(Object.entries(variants).map(([key, value]) => [key, Object.keys(value)]));
  return Object.assign(memo(cvaFn), {
    __cva__: true,
    variantMap,
    variantKeys,
    raw: resolve,
    config,
    merge,
    splitVariantProps,
    getVariantProps
  });
}
function getCompoundVariantCss(compoundVariants, variantMap) {
  let result = {};
  compoundVariants.forEach((compoundVariant) => {
    const isMatching = Object.entries(compoundVariant).every(([key, value]) => {
      if (key === "css") return true;
      const values = Array.isArray(value) ? value : [value];
      return values.some((value2) => variantMap[key] === value2);
    });
    if (isMatching) {
      result = mergeCss(result, compoundVariant.css);
    }
  });
  return result;
}

// styled-system/jsx/is-valid-prop.mjs
var userGeneratedStr = "css,pos,insetX,insetY,insetEnd,end,insetStart,start,flexDir,p,pl,pr,pt,pb,py,paddingY,paddingX,px,pe,paddingEnd,ps,paddingStart,ml,mr,mt,mb,m,my,marginY,mx,marginX,me,marginEnd,ms,marginStart,ringWidth,ringColor,ring,ringOffset,w,minW,maxW,h,minH,maxH,textShadowColor,bgPosition,bgPositionX,bgPositionY,bgAttachment,bgClip,bg,bgColor,bgOrigin,bgImage,bgRepeat,bgBlendMode,bgSize,bgGradient,bgLinear,bgRadial,bgConic,rounded,roundedTopLeft,roundedTopRight,roundedBottomRight,roundedBottomLeft,roundedTop,roundedRight,roundedBottom,roundedLeft,roundedStartStart,roundedStartEnd,roundedStart,roundedEndStart,roundedEndEnd,roundedEnd,borderX,borderXWidth,borderXColor,borderY,borderYWidth,borderYColor,borderStart,borderStartWidth,borderStartColor,borderEnd,borderEndWidth,borderEndColor,shadow,shadowColor,x,y,z,scrollMarginY,scrollMarginX,scrollPaddingY,scrollPaddingX,aspectRatio,boxDecorationBreak,zIndex,boxSizing,objectPosition,objectFit,overscrollBehavior,overscrollBehaviorX,overscrollBehaviorY,position,top,left,inset,insetInline,insetBlock,insetBlockEnd,insetBlockStart,insetInlineEnd,insetInlineStart,right,bottom,float,visibility,display,hideFrom,hideBelow,flexBasis,flex,flexDirection,flexGrow,flexShrink,gridTemplateColumns,gridTemplateRows,gridColumn,gridRow,gridColumnStart,gridColumnEnd,gridAutoFlow,gridAutoColumns,gridAutoRows,gap,gridGap,gridRowGap,gridColumnGap,rowGap,columnGap,justifyContent,alignContent,alignItems,alignSelf,padding,paddingLeft,paddingRight,paddingTop,paddingBottom,paddingBlock,paddingBlockEnd,paddingBlockStart,paddingInline,paddingInlineEnd,paddingInlineStart,marginLeft,marginRight,marginTop,marginBottom,margin,marginBlock,marginBlockEnd,marginBlockStart,marginInline,marginInlineEnd,marginInlineStart,spaceX,spaceY,outlineWidth,outlineColor,outline,outlineOffset,focusRing,focusVisibleRing,focusRingColor,focusRingOffset,focusRingWidth,focusRingStyle,divideX,divideY,divideColor,divideStyle,width,inlineSize,minWidth,minInlineSize,maxWidth,maxInlineSize,height,blockSize,minHeight,minBlockSize,maxHeight,maxBlockSize,boxSize,color,fontFamily,fontSize,fontSizeAdjust,fontPalette,fontKerning,fontFeatureSettings,fontWeight,fontSmoothing,fontVariant,fontVariantAlternates,fontVariantCaps,fontVariationSettings,fontVariantNumeric,letterSpacing,lineHeight,textAlign,textDecoration,textDecorationColor,textEmphasisColor,textDecorationStyle,textDecorationThickness,textUnderlineOffset,textTransform,textIndent,textShadow,textOverflow,verticalAlign,wordBreak,textWrap,truncate,lineClamp,listStyleType,listStylePosition,listStyleImage,listStyle,backgroundPosition,backgroundPositionX,backgroundPositionY,backgroundAttachment,backgroundClip,background,backgroundColor,backgroundOrigin,backgroundImage,backgroundRepeat,backgroundBlendMode,backgroundSize,backgroundGradient,backgroundLinear,backgroundRadial,backgroundConic,textGradient,gradientFromPosition,gradientToPosition,gradientFrom,gradientTo,gradientVia,gradientViaPosition,borderRadius,borderTopLeftRadius,borderTopRightRadius,borderBottomRightRadius,borderBottomLeftRadius,borderTopRadius,borderRightRadius,borderBottomRadius,borderLeftRadius,borderStartStartRadius,borderStartEndRadius,borderStartRadius,borderEndStartRadius,borderEndEndRadius,borderEndRadius,border,borderWidth,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,borderBlockStartWidth,borderBlockEndWidth,borderColor,borderInline,borderInlineWidth,borderInlineColor,borderBlock,borderBlockWidth,borderBlockColor,borderLeft,borderLeftColor,borderInlineStart,borderInlineStartWidth,borderInlineStartColor,borderRight,borderRightColor,borderInlineEnd,borderInlineEndWidth,borderInlineEndColor,borderTop,borderTopColor,borderBottom,borderBottomColor,borderBlockEnd,borderBlockEndColor,borderBlockStart,borderBlockStartColor,opacity,boxShadow,boxShadowColor,mixBlendMode,filter,brightness,contrast,grayscale,hueRotate,invert,saturate,sepia,dropShadow,blur,backdropFilter,backdropBlur,backdropBrightness,backdropContrast,backdropGrayscale,backdropHueRotate,backdropInvert,backdropOpacity,backdropSaturate,backdropSepia,borderCollapse,borderSpacing,borderSpacingX,borderSpacingY,tableLayout,transitionTimingFunction,transitionDelay,transitionDuration,transitionProperty,transition,animation,animationName,animationTimingFunction,animationDuration,animationDelay,animationPlayState,animationComposition,animationFillMode,animationDirection,animationIterationCount,animationRange,animationState,animationRangeStart,animationRangeEnd,animationTimeline,transformOrigin,transformBox,transformStyle,transform,rotate,rotateX,rotateY,rotateZ,scale,scaleX,scaleY,translate,translateX,translateY,translateZ,accentColor,caretColor,scrollBehavior,scrollbar,scrollbarColor,scrollbarGutter,scrollbarWidth,scrollMargin,scrollMarginLeft,scrollMarginRight,scrollMarginTop,scrollMarginBottom,scrollMarginBlock,scrollMarginBlockEnd,scrollMarginBlockStart,scrollMarginInline,scrollMarginInlineEnd,scrollMarginInlineStart,scrollPadding,scrollPaddingBlock,scrollPaddingBlockStart,scrollPaddingBlockEnd,scrollPaddingInline,scrollPaddingInlineEnd,scrollPaddingInlineStart,scrollPaddingLeft,scrollPaddingRight,scrollPaddingTop,scrollPaddingBottom,scrollSnapAlign,scrollSnapStop,scrollSnapType,scrollSnapStrictness,scrollSnapMargin,scrollSnapMarginTop,scrollSnapMarginBottom,scrollSnapMarginLeft,scrollSnapMarginRight,scrollSnapCoordinate,scrollSnapDestination,scrollSnapPointsX,scrollSnapPointsY,scrollSnapTypeX,scrollSnapTypeY,scrollTimeline,scrollTimelineAxis,scrollTimelineName,touchAction,userSelect,overflow,overflowWrap,overflowX,overflowY,overflowAnchor,overflowBlock,overflowInline,overflowClipBox,overflowClipMargin,overscrollBehaviorBlock,overscrollBehaviorInline,fill,stroke,strokeWidth,strokeDasharray,strokeDashoffset,strokeLinecap,strokeLinejoin,strokeMiterlimit,strokeOpacity,srOnly,debug,appearance,backfaceVisibility,clipPath,hyphens,mask,maskImage,maskSize,textSizeAdjust,container,containerName,containerType,cursor,colorPalette,_hover,_focus,_focusWithin,_focusVisible,_disabled,_active,_visited,_target,_readOnly,_readWrite,_empty,_checked,_enabled,_expanded,_highlighted,_complete,_incomplete,_dragging,_before,_after,_firstLetter,_firstLine,_marker,_selection,_file,_backdrop,_first,_last,_only,_even,_odd,_firstOfType,_lastOfType,_onlyOfType,_peerFocus,_peerHover,_peerActive,_peerFocusWithin,_peerFocusVisible,_peerDisabled,_peerChecked,_peerInvalid,_peerExpanded,_peerPlaceholderShown,_groupFocus,_groupHover,_groupActive,_groupFocusWithin,_groupFocusVisible,_groupDisabled,_groupChecked,_groupExpanded,_groupInvalid,_indeterminate,_required,_valid,_invalid,_autofill,_inRange,_outOfRange,_placeholder,_placeholderShown,_pressed,_selected,_grabbed,_underValue,_overValue,_atValue,_default,_optional,_open,_closed,_fullscreen,_loading,_hidden,_current,_currentPage,_currentStep,_today,_unavailable,_rangeStart,_rangeEnd,_now,_topmost,_motionReduce,_motionSafe,_print,_landscape,_portrait,_dark,_light,_osDark,_osLight,_highContrast,_lessContrast,_moreContrast,_ltr,_rtl,_scrollbar,_scrollbarThumb,_scrollbarTrack,_horizontal,_vertical,_icon,_starting,_noscript,_invertedColors,sm,smOnly,smDown,md,mdOnly,mdDown,lg,lgOnly,lgDown,xl,xlOnly,xlDown,2xl,2xlOnly,2xlDown,smToMd,smToLg,smToXl,smTo2xl,mdToLg,mdToXl,mdTo2xl,lgToXl,lgTo2xl,xlTo2xl,@/xs,@/sm,@/md,@/lg,@/xl,@/2xl,@/3xl,@/4xl,@/5xl,@/6xl,@/7xl,@/8xl,textStyle";
var userGenerated = userGeneratedStr.split(",");
var cssPropertiesStr = "WebkitAppearance,WebkitBorderBefore,WebkitBorderBeforeColor,WebkitBorderBeforeStyle,WebkitBorderBeforeWidth,WebkitBoxReflect,WebkitLineClamp,WebkitMask,WebkitMaskAttachment,WebkitMaskClip,WebkitMaskComposite,WebkitMaskImage,WebkitMaskOrigin,WebkitMaskPosition,WebkitMaskPositionX,WebkitMaskPositionY,WebkitMaskRepeat,WebkitMaskRepeatX,WebkitMaskRepeatY,WebkitMaskSize,WebkitOverflowScrolling,WebkitTapHighlightColor,WebkitTextFillColor,WebkitTextStroke,WebkitTextStrokeColor,WebkitTextStrokeWidth,WebkitTouchCallout,WebkitUserModify,WebkitUserSelect,accentColor,alignContent,alignItems,alignSelf,alignTracks,all,anchorName,anchorScope,animation,animationComposition,animationDelay,animationDirection,animationDuration,animationFillMode,animationIterationCount,animationName,animationPlayState,animationRange,animationRangeEnd,animationRangeStart,animationTimeline,animationTimingFunction,appearance,aspectRatio,backdropFilter,backfaceVisibility,background,backgroundAttachment,backgroundBlendMode,backgroundClip,backgroundColor,backgroundImage,backgroundOrigin,backgroundPosition,backgroundPositionX,backgroundPositionY,backgroundRepeat,backgroundSize,blockSize,border,borderBlock,borderBlockColor,borderBlockEnd,borderBlockEndColor,borderBlockEndStyle,borderBlockEndWidth,borderBlockStart,borderBlockStartColor,borderBlockStartStyle,borderBlockStartWidth,borderBlockStyle,borderBlockWidth,borderBottom,borderBottomColor,borderBottomLeftRadius,borderBottomRightRadius,borderBottomStyle,borderBottomWidth,borderCollapse,borderColor,borderEndEndRadius,borderEndStartRadius,borderImage,borderImageOutset,borderImageRepeat,borderImageSlice,borderImageSource,borderImageWidth,borderInline,borderInlineColor,borderInlineEnd,borderInlineEndColor,borderInlineEndStyle,borderInlineEndWidth,borderInlineStart,borderInlineStartColor,borderInlineStartStyle,borderInlineStartWidth,borderInlineStyle,borderInlineWidth,borderLeft,borderLeftColor,borderLeftStyle,borderLeftWidth,borderRadius,borderRight,borderRightColor,borderRightStyle,borderRightWidth,borderSpacing,borderStartEndRadius,borderStartStartRadius,borderStyle,borderTop,borderTopColor,borderTopLeftRadius,borderTopRightRadius,borderTopStyle,borderTopWidth,borderWidth,bottom,boxAlign,boxDecorationBreak,boxDirection,boxFlex,boxFlexGroup,boxLines,boxOrdinalGroup,boxOrient,boxPack,boxShadow,boxSizing,breakAfter,breakBefore,breakInside,captionSide,caret,caretColor,caretShape,clear,clip,clipPath,clipRule,color,colorInterpolationFilters,colorScheme,columnCount,columnFill,columnGap,columnRule,columnRuleColor,columnRuleStyle,columnRuleWidth,columnSpan,columnWidth,columns,contain,containIntrinsicBlockSize,containIntrinsicHeight,containIntrinsicInlineSize,containIntrinsicSize,containIntrinsicWidth,container,containerName,containerType,content,contentVisibility,counterIncrement,counterReset,counterSet,cursor,cx,cy,d,direction,display,dominantBaseline,emptyCells,fieldSizing,fill,fillOpacity,fillRule,filter,flex,flexBasis,flexDirection,flexFlow,flexGrow,flexShrink,flexWrap,float,floodColor,floodOpacity,font,fontFamily,fontFeatureSettings,fontKerning,fontLanguageOverride,fontOpticalSizing,fontPalette,fontSize,fontSizeAdjust,fontSmooth,fontStretch,fontStyle,fontSynthesis,fontSynthesisPosition,fontSynthesisSmallCaps,fontSynthesisStyle,fontSynthesisWeight,fontVariant,fontVariantAlternates,fontVariantCaps,fontVariantEastAsian,fontVariantEmoji,fontVariantLigatures,fontVariantNumeric,fontVariantPosition,fontVariationSettings,fontWeight,forcedColorAdjust,gap,grid,gridArea,gridAutoColumns,gridAutoFlow,gridAutoRows,gridColumn,gridColumnEnd,gridColumnGap,gridColumnStart,gridGap,gridRow,gridRowEnd,gridRowGap,gridRowStart,gridTemplate,gridTemplateAreas,gridTemplateColumns,gridTemplateRows,hangingPunctuation,height,hyphenateCharacter,hyphenateLimitChars,hyphens,imageOrientation,imageRendering,imageResolution,imeMode,initialLetter,initialLetterAlign,inlineSize,inset,insetBlock,insetBlockEnd,insetBlockStart,insetInline,insetInlineEnd,insetInlineStart,interpolateSize,isolation,justifyContent,justifyItems,justifySelf,justifyTracks,left,letterSpacing,lightingColor,lineBreak,lineClamp,lineHeight,lineHeightStep,listStyle,listStyleImage,listStylePosition,listStyleType,margin,marginBlock,marginBlockEnd,marginBlockStart,marginBottom,marginInline,marginInlineEnd,marginInlineStart,marginLeft,marginRight,marginTop,marginTrim,marker,markerEnd,markerMid,markerStart,mask,maskBorder,maskBorderMode,maskBorderOutset,maskBorderRepeat,maskBorderSlice,maskBorderSource,maskBorderWidth,maskClip,maskComposite,maskImage,maskMode,maskOrigin,maskPosition,maskRepeat,maskSize,maskType,masonryAutoFlow,mathDepth,mathShift,mathStyle,maxBlockSize,maxHeight,maxInlineSize,maxLines,maxWidth,minBlockSize,minHeight,minInlineSize,minWidth,mixBlendMode,objectFit,objectPosition,offset,offsetAnchor,offsetDistance,offsetPath,offsetPosition,offsetRotate,opacity,order,orphans,outline,outlineColor,outlineOffset,outlineStyle,outlineWidth,overflow,overflowAnchor,overflowBlock,overflowClipBox,overflowClipMargin,overflowInline,overflowWrap,overflowX,overflowY,overlay,overscrollBehavior,overscrollBehaviorBlock,overscrollBehaviorInline,overscrollBehaviorX,overscrollBehaviorY,padding,paddingBlock,paddingBlockEnd,paddingBlockStart,paddingBottom,paddingInline,paddingInlineEnd,paddingInlineStart,paddingLeft,paddingRight,paddingTop,page,pageBreakAfter,pageBreakBefore,pageBreakInside,paintOrder,perspective,perspectiveOrigin,placeContent,placeItems,placeSelf,pointerEvents,position,positionAnchor,positionArea,positionTry,positionTryFallbacks,positionTryOrder,positionVisibility,printColorAdjust,quotes,r,resize,right,rotate,rowGap,rubyAlign,rubyMerge,rubyPosition,rx,ry,scale,scrollBehavior,scrollMargin,scrollMarginBlock,scrollMarginBlockEnd,scrollMarginBlockStart,scrollMarginBottom,scrollMarginInline,scrollMarginInlineEnd,scrollMarginInlineStart,scrollMarginLeft,scrollMarginRight,scrollMarginTop,scrollPadding,scrollPaddingBlock,scrollPaddingBlockEnd,scrollPaddingBlockStart,scrollPaddingBottom,scrollPaddingInline,scrollPaddingInlineEnd,scrollPaddingInlineStart,scrollPaddingLeft,scrollPaddingRight,scrollPaddingTop,scrollSnapAlign,scrollSnapCoordinate,scrollSnapDestination,scrollSnapPointsX,scrollSnapPointsY,scrollSnapStop,scrollSnapType,scrollSnapTypeX,scrollSnapTypeY,scrollTimeline,scrollTimelineAxis,scrollTimelineName,scrollbarColor,scrollbarGutter,scrollbarWidth,shapeImageThreshold,shapeMargin,shapeOutside,shapeRendering,stopColor,stopOpacity,stroke,strokeDasharray,strokeDashoffset,strokeLinecap,strokeLinejoin,strokeMiterlimit,strokeOpacity,strokeWidth,tabSize,tableLayout,textAlign,textAlignLast,textAnchor,textBox,textBoxEdge,textBoxTrim,textCombineUpright,textDecoration,textDecorationColor,textDecorationLine,textDecorationSkip,textDecorationSkipInk,textDecorationStyle,textDecorationThickness,textEmphasis,textEmphasisColor,textEmphasisPosition,textEmphasisStyle,textIndent,textJustify,textOrientation,textOverflow,textRendering,textShadow,textSizeAdjust,textSpacingTrim,textTransform,textUnderlineOffset,textUnderlinePosition,textWrap,textWrapMode,textWrapStyle,timelineScope,top,touchAction,transform,transformBox,transformOrigin,transformStyle,transition,transitionBehavior,transitionDelay,transitionDuration,transitionProperty,transitionTimingFunction,translate,unicodeBidi,userSelect,vectorEffect,verticalAlign,viewTimeline,viewTimelineAxis,viewTimelineInset,viewTimelineName,viewTransitionName,visibility,whiteSpace,whiteSpaceCollapse,widows,width,willChange,wordBreak,wordSpacing,wordWrap,writingMode,x,y,zIndex,zoom,alignmentBaseline,baselineShift,colorInterpolation,colorRendering,glyphOrientationVertical";
var allCssProperties = cssPropertiesStr.split(",").concat(userGenerated);
var properties = new Map(allCssProperties.map((prop) => [prop, true]));
var cssPropertySelectorRegex = /&|@/;
var isCssProperty = /* @__PURE__ */ memo((prop) => {
  return properties.has(prop) || prop.startsWith("--") || cssPropertySelectorRegex.test(prop);
});

// styled-system/jsx/factory-helper.mjs
var defaultShouldForwardProp = (prop, variantKeys) => !variantKeys.includes(prop) && !isCssProperty(prop);
var composeShouldForwardProps = (tag, shouldForwardProp) => tag.__shouldForwardProps__ && shouldForwardProp ? (propName) => tag.__shouldForwardProps__(propName) && shouldForwardProp(propName) : shouldForwardProp;
var composeCvaFn = (cvaA, cvaB) => {
  if (cvaA && !cvaB) return cvaA;
  if (!cvaA && cvaB) return cvaB;
  if (cvaA.__cva__ && cvaB.__cva__ || cvaA.__recipe__ && cvaB.__recipe__) return cvaA.merge(cvaB);
  const error = new TypeError("Cannot merge cva with recipe. Please use either cva or recipe.");
  TypeError.captureStackTrace?.(error);
  throw error;
};
var getDisplayName = (Component) => {
  if (typeof Component === "string") return Component;
  return Component?.displayName || Component?.name || "Component";
};

// styled-system/jsx/factory.mjs
function styledFn(Dynamic, configOrCva = {}, options = {}) {
  const cvaFn = configOrCva.__cva__ || configOrCva.__recipe__ ? configOrCva : cva(configOrCva);
  const forwardFn = options.shouldForwardProp || defaultShouldForwardProp;
  const shouldForwardProp = (prop) => {
    if (options.forwardProps?.includes(prop)) return true;
    return forwardFn(prop, cvaFn.variantKeys);
  };
  const defaultProps = Object.assign(
    options.dataAttr && configOrCva.__name__ ? { "data-recipe": configOrCva.__name__ } : {},
    options.defaultProps
  );
  const __cvaFn__ = composeCvaFn(Dynamic.__cva__, cvaFn);
  const __shouldForwardProps__ = composeShouldForwardProps(Dynamic, shouldForwardProp);
  const __base__ = Dynamic.__base__ || Dynamic;
  const StyledComponent = /* @__PURE__ */ forwardRef(function StyledComponent2(props, ref) {
    const { as: Element = __base__, unstyled, children, ...restProps } = props;
    const combinedProps = useMemo(() => Object.assign({}, defaultProps, restProps), [restProps]);
    const [htmlProps2, forwardedProps, variantProps, styleProps, elementProps] = useMemo(() => {
      return splitProps(combinedProps, normalizeHTMLProps.keys, __shouldForwardProps__, __cvaFn__.variantKeys, isCssProperty);
    }, [combinedProps]);
    function recipeClass() {
      const { css: cssStyles, ...propStyles } = styleProps;
      const compoundVariantStyles = __cvaFn__.__getCompoundVariantCss__?.(variantProps);
      return cx(__cvaFn__(variantProps, false), css(compoundVariantStyles, propStyles, cssStyles), combinedProps.className);
    }
    function cvaClass() {
      const { css: cssStyles, ...propStyles } = styleProps;
      const cvaStyles = __cvaFn__.raw(variantProps);
      return cx(css(cvaStyles, propStyles, cssStyles), combinedProps.className);
    }
    const classes = () => {
      if (unstyled) {
        const { css: cssStyles, ...propStyles } = styleProps;
        return cx(css(propStyles, cssStyles), combinedProps.className);
      }
      return configOrCva.__recipe__ ? recipeClass() : cvaClass();
    };
    return createElement(Element, {
      ref,
      ...forwardedProps,
      ...elementProps,
      ...normalizeHTMLProps(htmlProps2),
      className: classes()
    }, children ?? combinedProps.children);
  });
  const name = getDisplayName(__base__);
  StyledComponent.displayName = `styled.${name}`;
  StyledComponent.__cva__ = __cvaFn__;
  StyledComponent.__base__ = __base__;
  StyledComponent.__shouldForwardProps__ = shouldForwardProp;
  return StyledComponent;
}
function createJsxFactory() {
  const cache = /* @__PURE__ */ new Map();
  return new Proxy(styledFn, {
    apply(_, __, args) {
      return styledFn(...args);
    },
    get(_, el) {
      if (!cache.has(el)) {
        cache.set(el, styledFn(el));
      }
      return cache.get(el);
    }
  });
}
var styled = /* @__PURE__ */ createJsxFactory();

// styled-system/patterns/grid.mjs
var gridConfig = {
  transform(props, { map, isCssUnit: isCssUnit2 }) {
    const { columnGap, rowGap, gap, columns, minChildWidth, ...rest } = props;
    const getValue = (v) => isCssUnit2(v) ? v : `token(sizes.${v}, ${v})`;
    return {
      display: "grid",
      gridTemplateColumns: columns != null ? map(columns, (v) => `repeat(${v}, minmax(0, 1fr))`) : minChildWidth != null ? map(minChildWidth, (v) => `repeat(auto-fit, minmax(${getValue(v)}, 1fr))`) : void 0,
      gap,
      columnGap,
      rowGap,
      ...rest
    };
  },
  defaultValues(props) {
    return { gap: props.columnGap || props.rowGap ? void 0 : "8px" };
  }
};
var getGridStyle = (styles = {}) => {
  const _styles = getPatternStyles(gridConfig, styles);
  return gridConfig.transform(_styles, patternFns);
};
var grid = (styles) => css(getGridStyle(styles));
grid.raw = getGridStyle;

// styled-system/patterns/grid-item.mjs
var gridItemConfig = {
  transform(props, { map }) {
    const { colSpan, rowSpan, colStart, rowStart, colEnd, rowEnd, ...rest } = props;
    const spanFn = (v) => v === "auto" ? v : `span ${v}`;
    return {
      gridColumn: colSpan != null ? map(colSpan, spanFn) : void 0,
      gridRow: rowSpan != null ? map(rowSpan, spanFn) : void 0,
      gridColumnStart: colStart,
      gridColumnEnd: colEnd,
      gridRowStart: rowStart,
      gridRowEnd: rowEnd,
      ...rest
    };
  }
};
var getGridItemStyle = (styles = {}) => {
  const _styles = getPatternStyles(gridItemConfig, styles);
  return gridItemConfig.transform(_styles, patternFns);
};
var gridItem = (styles) => css(getGridItemStyle(styles));
gridItem.raw = getGridItemStyle;

// src/button/button.recipes.ts
var buttonRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "xs",
    px: "md",
    py: "sm",
    borderRadius: "component.buttonRadius",
    fontFamily: "brand",
    fontSize: "md",
    fontWeight: "bold",
    lineHeight: "1",
    border: "none",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.15s ease",
    userSelect: "none",
    whiteSpace: "nowrap",
    // Set CSS variable for child spinners to use the button's text color
    "--spinner-color": "currentColor",
    _hover: {
      transform: "translateY(-1px)"
    },
    _active: {
      transform: "translateY(0)"
    },
    _focus: {
      boxShadow: "focus.button"
    },
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      pointerEvents: "none"
    }
  },
  variants: {
    variant: {
      primary: {
        bg: "button.primary.bg",
        color: "button.primary.text",
        _hover: {
          bg: "button.primary.bgHover"
        }
      },
      secondary: {
        bg: "button.secondary.bg",
        color: "button.secondary.text",
        border: "1px solid",
        borderColor: "button.secondary.border",
        _hover: {
          bg: "button.secondary.bgHover",
          borderColor: "accent.primary"
        }
      },
      danger: {
        bg: "button.danger.bg",
        color: "button.danger.text",
        _hover: {
          bg: "button.danger.bgHover"
        }
      },
      ghost: {
        bg: "transparent",
        color: "text.link",
        _hover: {
          bg: "background.subtle",
          color: "text.linkHover"
        }
      }
    },
    size: {
      sm: {
        px: "sm",
        py: "xs",
        fontSize: "sm",
        minHeight: "32px"
      },
      md: {
        px: "md",
        py: "sm",
        fontSize: "md",
        minHeight: "component.buttonMinHeight"
      },
      lg: {
        px: "lg",
        py: "md",
        fontSize: "lg",
        minHeight: "48px"
      }
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md"
  }
});

// src/button/Button.tsx
import { jsx } from "react/jsx-runtime";
var StyledButton = styled("button", buttonRecipe);
var Button = forwardRef2(
  ({ type = "button", ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      StyledButton,
      {
        ref,
        type,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// src/input/Input.tsx
import { forwardRef as forwardRef3, useId } from "react";

// src/shared/form-elements.tsx
import "react";
var FormContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "xs"
  }
});
var FormLabel = styled("label", {
  base: {
    fontFamily: "brand",
    fontSize: "sm",
    fontWeight: "bold",
    color: "text.primary",
    cursor: "pointer"
  }
});
var FormHelperText = styled("span", {
  base: {
    fontFamily: "brand",
    fontSize: "sm",
    lineHeight: "normal"
  },
  variants: {
    isError: {
      true: {
        color: "state.danger"
      },
      false: {
        color: "text.subtle"
      }
    }
  }
});
var FormItemContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "sm"
  }
});

// src/input/Input.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var StyledInput = styled("input", {
  base: {
    px: "md",
    py: "sm",
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    bg: "background.elevated",
    border: "1px solid",
    borderColor: "border.subtle",
    borderRadius: "component.inputRadius",
    outline: "none",
    transition: "all 0.15s ease",
    minHeight: "component.inputMinHeight",
    _placeholder: {
      color: "text.subtle"
    },
    _hover: {
      borderColor: "border.strong"
    },
    _focus: {
      borderColor: "accent.primary",
      boxShadow: "focus.primary"
    },
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      bg: "background.subtle"
    }
  },
  variants: {
    hasError: {
      true: {
        borderColor: "state.danger",
        _focus: {
          borderColor: "state.danger",
          boxShadow: "focus.danger"
        }
      }
    }
  }
});
var Input = forwardRef3(
  ({
    label,
    error,
    helperText,
    disabled,
    id,
    className,
    ...props
  }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);
    return /* @__PURE__ */ jsxs(FormContainer, { className, children: [
      label && /* @__PURE__ */ jsx2(FormLabel, { htmlFor: inputId, children: label }),
      /* @__PURE__ */ jsx2(
        StyledInput,
        {
          ref,
          id: inputId,
          disabled,
          "aria-invalid": hasError,
          "aria-describedby": error ? `${inputId}-error` : helperText ? `${inputId}-helper` : void 0,
          hasError,
          ...props
        }
      ),
      error && /* @__PURE__ */ jsx2(
        FormHelperText,
        {
          id: `${inputId}-error`,
          isError: true,
          role: "alert",
          children: error
        }
      ),
      !error && helperText && /* @__PURE__ */ jsx2(
        FormHelperText,
        {
          id: `${inputId}-helper`,
          isError: false,
          children: helperText
        }
      )
    ] });
  }
);
Input.displayName = "Input";

// src/textarea/Textarea.tsx
import { forwardRef as forwardRef4, useId as useId2 } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var StyledTextarea = styled("textarea", {
  base: {
    px: "md",
    py: "sm",
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    bg: "background.elevated",
    border: "1px solid",
    borderColor: "border.subtle",
    borderRadius: "component.inputRadius",
    outline: "none",
    transition: "all 0.15s ease",
    minHeight: "component.textareaMinHeight",
    resize: "vertical",
    _placeholder: {
      color: "text.subtle"
    },
    _hover: {
      borderColor: "border.strong"
    },
    _focus: {
      borderColor: "accent.primary",
      boxShadow: "focus.primary"
    },
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      bg: "background.subtle"
    }
  },
  variants: {
    hasError: {
      true: {
        borderColor: "state.danger",
        _focus: {
          borderColor: "state.danger",
          boxShadow: "focus.danger"
        }
      }
    }
  }
});
var Textarea = forwardRef4(
  ({
    label,
    error,
    helperText,
    disabled,
    id,
    className,
    ...props
  }, ref) => {
    const generatedId = useId2();
    const textareaId = id || generatedId;
    const hasError = Boolean(error);
    return /* @__PURE__ */ jsxs2(FormContainer, { className, children: [
      label && /* @__PURE__ */ jsx3(FormLabel, { htmlFor: textareaId, children: label }),
      /* @__PURE__ */ jsx3(
        StyledTextarea,
        {
          ref,
          id: textareaId,
          disabled,
          "aria-invalid": hasError,
          "aria-describedby": error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : void 0,
          hasError,
          ...props
        }
      ),
      error && /* @__PURE__ */ jsx3(
        FormHelperText,
        {
          id: `${textareaId}-error`,
          isError: true,
          role: "alert",
          children: error
        }
      ),
      !error && helperText && /* @__PURE__ */ jsx3(
        FormHelperText,
        {
          id: `${textareaId}-helper`,
          isError: false,
          children: helperText
        }
      )
    ] });
  }
);
Textarea.displayName = "Textarea";

// src/alert/Alert.tsx
import { forwardRef as forwardRef5 } from "react";

// src/alert/alert.recipes.ts
var alertRecipe = cva({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: "sm",
    px: "md",
    py: "md",
    borderRadius: "component.alertRadius",
    borderWidth: "1px",
    borderStyle: "solid",
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "1.5"
  },
  variants: {
    variant: {
      info: {
        bg: "alert.info.bg",
        borderColor: "alert.info.border",
        color: "alert.info.text"
      },
      success: {
        bg: "alert.success.bg",
        borderColor: "alert.success.border",
        color: "alert.success.text"
      },
      warning: {
        bg: "alert.warning.bg",
        borderColor: "alert.warning.border",
        color: "alert.warning.text"
      },
      danger: {
        bg: "alert.danger.bg",
        borderColor: "alert.danger.border",
        color: "alert.danger.text"
      }
    }
  },
  defaultVariants: {
    variant: "info"
  }
});

// src/alert/Alert.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
var StyledAlert = styled("div", alertRecipe);
var Alert = forwardRef5(
  ({ children, priority = "polite", ...props }, ref) => {
    return /* @__PURE__ */ jsx4(
      StyledAlert,
      {
        ref,
        role: priority === "assertive" ? "alert" : "status",
        "aria-live": priority,
        ...props,
        children
      }
    );
  }
);
Alert.displayName = "Alert";

// src/spinner/Spinner.tsx
import { forwardRef as forwardRef6 } from "react";

// src/spinner/spinner.recipes.ts
var spinnerRecipe = cva({
  base: {
    fontFamily: "brand",
    display: "inline-block",
    borderStyle: "solid",
    borderColor: "currentColor",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin durations.spinner linear infinite",
    // Use parent's --spinner-color if set (e.g., from Button), otherwise default to blue
    color: "var(--spinner-color, var(--colors-spinner-color))"
  },
  variants: {
    size: {
      sm: {
        width: "component.spinnerSm",
        height: "component.spinnerSm",
        borderWidth: "2px"
      },
      md: {
        width: "component.spinnerMd",
        height: "component.spinnerMd",
        borderWidth: "3px"
      },
      lg: {
        width: "component.spinnerLg",
        height: "component.spinnerLg",
        borderWidth: "4px"
      }
    }
  },
  defaultVariants: {
    size: "md"
  }
});

// src/spinner/Spinner.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var StyledSpinner = styled("div", spinnerRecipe);
var Spinner = forwardRef6(
  ({ label = "Loading", size, ...props }, ref) => {
    return /* @__PURE__ */ jsx5(
      StyledSpinner,
      {
        ref,
        role: "status",
        "aria-label": label,
        size,
        ...props
      }
    );
  }
);
Spinner.displayName = "Spinner";

// src/card/Card.tsx
import { forwardRef as forwardRef7 } from "react";

// src/card/card.recipes.ts
var cardRecipe = cva({
  base: {
    fontFamily: "brand",
    bg: "background.elevated",
    borderRadius: "component.cardRadius",
    border: "1px solid",
    borderColor: "border.subtle",
    padding: "lg",
    transition: "all 0.15s ease",
    display: "flex",
    flexDirection: "column"
  },
  variants: {
    isElevated: {
      true: {
        boxShadow: "component.cardShadow",
        _hover: {
          transform: "translateY(-2px)",
          boxShadow: "component.modalShadow"
        }
      }
    }
  },
  defaultVariants: {
    isElevated: false
  }
});

// src/card/Card.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
var StyledCard = styled("div", cardRecipe);
var CardActions = styled("div", {
  base: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "sm",
    marginTop: "auto"
  }
});
var Card = forwardRef7(
  (props, ref) => {
    return /* @__PURE__ */ jsx6(StyledCard, { ref, ...props });
  }
);
Card.displayName = "Card";

// src/badge/Badge.tsx
import { forwardRef as forwardRef8 } from "react";

// src/badge/badge.recipes.ts
var badgeRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    px: "sm",
    py: "xs",
    fontFamily: "brand",
    fontSize: "xs",
    fontWeight: "bold",
    lineHeight: "1",
    borderRadius: "component.badgeRadius",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  variants: {
    status: {
      info: {
        bg: "state.info",
        color: "neutral.light"
      },
      success: {
        bg: "state.success",
        color: "neutral.light"
      },
      warning: {
        bg: "state.warning",
        color: "neutral.dark"
      },
      danger: {
        bg: "state.danger",
        color: "neutral.light"
      },
      neutral: {
        bg: "neutral.base",
        color: "text.primary"
      }
    }
  },
  defaultVariants: {
    status: "neutral"
  }
});

// src/badge/Badge.tsx
import { jsx as jsx7 } from "react/jsx-runtime";
var StyledBadge = styled("span", badgeRecipe);
var Badge = forwardRef8(
  (props, ref) => {
    return /* @__PURE__ */ jsx7(StyledBadge, { ref, ...props });
  }
);
Badge.displayName = "Badge";

// src/select/Select.tsx
import { forwardRef as forwardRef9, useId as useId3 } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { jsx as jsx8, jsxs as jsxs3 } from "react/jsx-runtime";
var Trigger2 = styled(SelectPrimitive.Trigger, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: "md",
    py: "sm",
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    bg: "background.elevated",
    border: "1px solid",
    borderColor: "border.subtle",
    borderRadius: "component.inputRadius",
    minHeight: "component.inputMinHeight",
    minWidth: "200px",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.15s ease",
    _hover: {
      borderColor: "border.strong"
    },
    _focus: {
      borderColor: "accent.primary",
      boxShadow: "focus.primary"
    },
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed"
    }
  },
  variants: {
    hasError: {
      true: {
        borderColor: "state.danger",
        _focus: {
          borderColor: "state.danger",
          boxShadow: "focus.danger"
        }
      }
    }
  }
});
var Content2 = styled(SelectPrimitive.Content, {
  base: {
    overflow: "hidden",
    bg: "background.elevated",
    borderRadius: "component.inputRadius",
    boxShadow: "component.dropdownShadow",
    border: "1px solid",
    borderColor: "border.subtle",
    zIndex: "zIndex.dropdown"
  }
});
var Viewport2 = styled(SelectPrimitive.Viewport, {
  base: {
    padding: "xs"
  }
});
var Item2 = styled(SelectPrimitive.Item, {
  base: {
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    px: "md",
    py: "sm",
    position: "relative",
    userSelect: "none",
    outline: "none",
    cursor: "pointer",
    _hover: {
      bg: "selection.bg",
      color: "text.primary"
    },
    _focus: {
      bg: "selection.bg"
    },
    _focusVisible: {
      boxShadow: "focus.primary"
    },
    "&[data-highlighted]": {
      bg: "selection.bg",
      color: "text.primary"
    },
    '&[data-state="checked"]': {
      bg: "selection.bg",
      color: "accent.primary",
      fontWeight: "medium"
    },
    "&[data-disabled]": {
      opacity: 0.5,
      pointerEvents: "none"
    }
  }
});
var Select = forwardRef9(
  ({ label, options, value, onValueChange, placeholder, disabled, id, error, helperText }, ref) => {
    const generatedId = useId3();
    const selectId = id || generatedId;
    const hasError = Boolean(error);
    return /* @__PURE__ */ jsxs3(FormContainer, { children: [
      label && /* @__PURE__ */ jsx8(FormLabel, { htmlFor: selectId, children: label }),
      /* @__PURE__ */ jsxs3(
        SelectPrimitive.Root,
        {
          value,
          onValueChange,
          disabled,
          children: [
            /* @__PURE__ */ jsxs3(
              Trigger2,
              {
                ref,
                id: selectId,
                "aria-label": label,
                "aria-invalid": hasError,
                "aria-describedby": error ? `${selectId}-error` : helperText ? `${selectId}-helper` : void 0,
                hasError,
                children: [
                  /* @__PURE__ */ jsx8(SelectPrimitive.Value, { placeholder }),
                  /* @__PURE__ */ jsx8(SelectPrimitive.Icon, { children: "\u25BC" })
                ]
              }
            ),
            /* @__PURE__ */ jsx8(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsx8(Content2, { position: "popper", sideOffset: 4, children: /* @__PURE__ */ jsx8(Viewport2, { children: options.map((option) => /* @__PURE__ */ jsx8(
              Item2,
              {
                value: option.value,
                disabled: option.disabled,
                children: /* @__PURE__ */ jsx8(SelectPrimitive.ItemText, { children: option.label })
              },
              option.value
            )) }) }) })
          ]
        }
      ),
      error && /* @__PURE__ */ jsx8(
        FormHelperText,
        {
          id: `${selectId}-error`,
          isError: true,
          role: "alert",
          children: error
        }
      ),
      !error && helperText && /* @__PURE__ */ jsx8(
        FormHelperText,
        {
          id: `${selectId}-helper`,
          isError: false,
          children: helperText
        }
      )
    ] });
  }
);
Select.displayName = "Select";

// src/checkbox/Checkbox.tsx
import { forwardRef as forwardRef10, useId as useId4 } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { jsx as jsx9, jsxs as jsxs4 } from "react/jsx-runtime";
var StyledCheckbox = styled(CheckboxPrimitive.Root, {
  base: {
    width: "20px",
    height: "20px",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid",
    borderColor: "border.strong",
    bg: "background.elevated",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.15s ease",
    _hover: {
      borderColor: "accent.primary"
    },
    _focus: {
      boxShadow: "focus.primary"
    },
    '&[data-state="checked"]': {
      bg: "accent.primary",
      borderColor: "accent.primary"
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed"
    }
  },
  variants: {
    hasError: {
      true: {
        borderColor: "state.danger",
        _focus: {
          boxShadow: "focus.danger"
        },
        _hover: {
          borderColor: "state.danger"
        }
      }
    }
  }
});
var Indicator2 = styled(CheckboxPrimitive.Indicator, {
  base: {
    color: "neutral.light",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
});
var Label = styled("label", {
  base: {
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    cursor: "pointer",
    userSelect: "none"
  }
});
var Checkbox = forwardRef10(
  ({ label, checked, defaultChecked, onCheckedChange, disabled, id, error, helperText }, ref) => {
    const generatedId = useId4();
    const checkboxId = id || generatedId;
    const hasError = Boolean(error);
    return /* @__PURE__ */ jsxs4(FormContainer, { children: [
      /* @__PURE__ */ jsxs4(FormItemContainer, { children: [
        /* @__PURE__ */ jsx9(
          StyledCheckbox,
          {
            ref,
            id: checkboxId,
            checked,
            defaultChecked,
            onCheckedChange,
            disabled,
            "aria-invalid": hasError,
            "aria-describedby": error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : void 0,
            hasError,
            children: /* @__PURE__ */ jsx9(Indicator2, { children: /* @__PURE__ */ jsx9(
              "svg",
              {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /* @__PURE__ */ jsx9(
                  "path",
                  {
                    d: "M10 3L4.5 8.5L2 6",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                  }
                )
              }
            ) })
          }
        ),
        label && /* @__PURE__ */ jsx9(Label, { htmlFor: checkboxId, children: label })
      ] }),
      error && /* @__PURE__ */ jsx9(
        FormHelperText,
        {
          id: `${checkboxId}-error`,
          isError: true,
          role: "alert",
          children: error
        }
      ),
      !error && helperText && /* @__PURE__ */ jsx9(
        FormHelperText,
        {
          id: `${checkboxId}-helper`,
          isError: false,
          children: helperText
        }
      )
    ] });
  }
);
Checkbox.displayName = "Checkbox";

// src/radio-group/RadioGroup.tsx
import { forwardRef as forwardRef11, useId as useId5 } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { jsx as jsx10, jsxs as jsxs5 } from "react/jsx-runtime";
var Root4 = styled(RadioGroupPrimitive.Root, {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "sm"
  }
});
var ItemContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "sm"
  }
});
var Item4 = styled(RadioGroupPrimitive.Item, {
  base: {
    width: "20px",
    height: "20px",
    borderRadius: "pill",
    border: "2px solid",
    borderColor: "border.strong",
    bg: "background.elevated",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.15s ease",
    _hover: {
      borderColor: "accent.primary"
    },
    _focus: {
      boxShadow: "focus.primary"
    },
    '&[data-state="checked"]': {
      borderColor: "accent.primary"
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed"
    }
  },
  variants: {
    hasError: {
      true: {
        borderColor: "state.danger",
        _focus: {
          boxShadow: "focus.danger"
        },
        _hover: {
          borderColor: "state.danger"
        }
      }
    }
  }
});
var Indicator4 = styled(RadioGroupPrimitive.Indicator, {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    position: "relative",
    "&::after": {
      content: '""',
      display: "block",
      width: "10px",
      height: "10px",
      borderRadius: "pill",
      bg: "accent.primary"
    }
  }
});
var ItemLabel = styled("label", {
  base: {
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    cursor: "pointer",
    userSelect: "none"
  }
});
var RadioGroup = forwardRef11(
  ({ label, options, value, defaultValue, onValueChange, disabled, id, error, helperText }, ref) => {
    const generatedId = useId5();
    const radioGroupId = id || generatedId;
    const labelId = `${radioGroupId}-label`;
    const hasError = Boolean(error);
    return /* @__PURE__ */ jsxs5(FormContainer, { children: [
      label && /* @__PURE__ */ jsx10(FormLabel, { id: labelId, children: label }),
      /* @__PURE__ */ jsx10(
        Root4,
        {
          ref,
          id: radioGroupId,
          value,
          defaultValue,
          onValueChange,
          disabled,
          "aria-invalid": hasError,
          "aria-labelledby": label ? labelId : void 0,
          "aria-describedby": error ? `${radioGroupId}-error` : helperText ? `${radioGroupId}-helper` : void 0,
          children: options.map((option, index) => {
            const itemId = `${radioGroupId}-${index}`;
            return /* @__PURE__ */ jsxs5(ItemContainer, { children: [
              /* @__PURE__ */ jsx10(
                Item4,
                {
                  value: option.value,
                  id: itemId,
                  disabled: option.disabled,
                  hasError,
                  children: /* @__PURE__ */ jsx10(Indicator4, {})
                }
              ),
              /* @__PURE__ */ jsx10(ItemLabel, { htmlFor: itemId, children: option.label })
            ] }, option.value);
          })
        }
      ),
      error && /* @__PURE__ */ jsx10(
        FormHelperText,
        {
          id: `${radioGroupId}-error`,
          isError: true,
          role: "alert",
          children: error
        }
      ),
      !error && helperText && /* @__PURE__ */ jsx10(
        FormHelperText,
        {
          id: `${radioGroupId}-helper`,
          isError: false,
          children: helperText
        }
      )
    ] });
  }
);
RadioGroup.displayName = "RadioGroup";

// src/switch/Switch.tsx
import { forwardRef as forwardRef12, useId as useId6 } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { jsx as jsx11, jsxs as jsxs6 } from "react/jsx-runtime";
var Root6 = styled(SwitchPrimitive.Root, {
  base: {
    width: "44px",
    height: "24px",
    bg: "border.strong",
    borderRadius: "pill",
    position: "relative",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.15s ease",
    _hover: {
      bg: "neutral.base"
    },
    _focus: {
      boxShadow: "focus.primary"
    },
    '&[data-state="checked"]': {
      bg: "accent.primary",
      _hover: {
        bg: "accent.dark"
      }
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed"
    }
  },
  variants: {
    hasError: {
      true: {
        outline: "2px solid",
        outlineColor: "state.danger",
        _focus: {
          boxShadow: "focus.danger"
        }
      }
    }
  }
});
var Thumb2 = styled(SwitchPrimitive.Thumb, {
  base: {
    display: "block",
    width: "18px",
    height: "18px",
    bg: "background.base",
    borderRadius: "pill",
    transition: "transform 0.15s ease",
    transform: "translateX(3px)",
    willChange: "transform",
    '&[data-state="checked"]': {
      transform: "translateX(23px)"
    }
  }
});
var Label2 = styled("label", {
  base: {
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    cursor: "pointer",
    userSelect: "none"
  }
});
var Switch = forwardRef12(
  ({ label, checked, defaultChecked, onCheckedChange, disabled, id, error, helperText }, ref) => {
    const generatedId = useId6();
    const switchId = id || generatedId;
    const hasError = Boolean(error);
    return /* @__PURE__ */ jsxs6(FormContainer, { children: [
      /* @__PURE__ */ jsxs6(FormItemContainer, { children: [
        /* @__PURE__ */ jsx11(
          Root6,
          {
            ref,
            id: switchId,
            checked,
            defaultChecked,
            onCheckedChange,
            disabled,
            "aria-invalid": hasError,
            "aria-describedby": error ? `${switchId}-error` : helperText ? `${switchId}-helper` : void 0,
            hasError,
            children: /* @__PURE__ */ jsx11(Thumb2, {})
          }
        ),
        label && /* @__PURE__ */ jsx11(Label2, { htmlFor: switchId, children: label })
      ] }),
      error && /* @__PURE__ */ jsx11(
        FormHelperText,
        {
          id: `${switchId}-error`,
          isError: true,
          role: "alert",
          children: error
        }
      ),
      !error && helperText && /* @__PURE__ */ jsx11(
        FormHelperText,
        {
          id: `${switchId}-helper`,
          isError: false,
          children: helperText
        }
      )
    ] });
  }
);
Switch.displayName = "Switch";

// src/dialog/Dialog.tsx
import { forwardRef as forwardRef13, isValidElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { jsx as jsx12, jsxs as jsxs7 } from "react/jsx-runtime";
var Overlay2 = styled(DialogPrimitive.Overlay, {
  base: {
    bg: "overlay.modal",
    position: "fixed",
    inset: "0",
    zIndex: "zIndex.modal"
  }
});
var Content4 = styled(DialogPrimitive.Content, {
  base: {
    bg: "background.elevated",
    borderRadius: "component.modalRadius",
    boxShadow: "component.modalShadow",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    maxWidth: "500px",
    maxHeight: "85vh",
    padding: "xl",
    zIndex: "zIndex.modal",
    outline: "none",
    _focus: {
      outline: "none"
    }
  }
});
var Title2 = styled(DialogPrimitive.Title, {
  base: {
    fontFamily: "brand",
    fontSize: "2xl",
    fontWeight: "bold",
    color: "text.primary",
    marginBottom: "sm"
  }
});
var Description2 = styled(DialogPrimitive.Description, {
  base: {
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.secondary",
    marginBottom: "lg"
  }
});
var CloseButton = styled(DialogPrimitive.Close, {
  base: {
    position: "absolute",
    top: "md",
    right: "md",
    width: "32px",
    height: "32px",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "text.secondary",
    cursor: "pointer",
    border: "none",
    bg: "transparent",
    outline: "none",
    transition: "all 0.15s ease",
    _hover: {
      bg: "background.subtle",
      color: "text.primary"
    },
    _focus: {
      boxShadow: "focus.dialog"
    }
  }
});
var Dialog = forwardRef13(
  ({ title, description, children, trigger, open, defaultOpen, onOpenChange }, ref) => {
    if (process.env.NODE_ENV !== "production" && trigger && !isValidElement(trigger)) {
      console.warn(
        "Dialog: `trigger` prop must be a single React element. Received:",
        typeof trigger,
        trigger
      );
    }
    return /* @__PURE__ */ jsxs7(
      DialogPrimitive.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          trigger && /* @__PURE__ */ jsx12(DialogPrimitive.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsxs7(DialogPrimitive.Portal, { children: [
            /* @__PURE__ */ jsx12(Overlay2, {}),
            /* @__PURE__ */ jsxs7(Content4, { ref, children: [
              title && /* @__PURE__ */ jsx12(Title2, { children: title }),
              description && /* @__PURE__ */ jsx12(Description2, { children: description }),
              children,
              /* @__PURE__ */ jsx12(CloseButton, { "aria-label": "Close", children: /* @__PURE__ */ jsx12(
                "svg",
                {
                  width: "16",
                  height: "16",
                  viewBox: "0 0 16 16",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg",
                  children: /* @__PURE__ */ jsx12(
                    "path",
                    {
                      d: "M12 4L4 12M4 4L12 12",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      strokeLinecap: "round"
                    }
                  )
                }
              ) })
            ] })
          ] })
        ]
      }
    );
  }
);
Dialog.displayName = "Dialog";

// src/dropdown-menu/DropdownMenu.tsx
import { forwardRef as forwardRef14, isValidElement as isValidElement2 } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
var Content6 = styled(DropdownMenuPrimitive.Content, {
  base: {
    minWidth: "200px",
    bg: "background.elevated",
    borderRadius: "component.inputRadius",
    padding: "xs",
    boxShadow: "component.dropdownShadow",
    border: "1px solid",
    borderColor: "border.subtle",
    zIndex: "zIndex.dropdown"
  }
});
var Item6 = styled(DropdownMenuPrimitive.Item, {
  base: {
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal",
    color: "text.primary",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    px: "md",
    py: "sm",
    position: "relative",
    userSelect: "none",
    outline: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
    _hover: {
      bg: "selection.bg",
      color: "text.primary"
    },
    _focus: {
      bg: "selection.bg"
    },
    _focusVisible: {
      boxShadow: "focus.primary"
    },
    "&[data-highlighted]": {
      bg: "selection.bg",
      color: "text.primary"
    },
    "&[data-disabled]": {
      opacity: 0.5,
      pointerEvents: "none"
    }
  }
});
var DropdownMenu = forwardRef14(
  ({ trigger, items, open, defaultOpen, onOpenChange }, ref) => {
    if (process.env.NODE_ENV !== "production" && !isValidElement2(trigger)) {
      console.warn(
        "DropdownMenu: `trigger` prop must be a single React element. Received:",
        typeof trigger,
        trigger
      );
    }
    return /* @__PURE__ */ jsxs8(
      DropdownMenuPrimitive.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          /* @__PURE__ */ jsx13(DropdownMenuPrimitive.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsx13(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx13(Content6, { ref, sideOffset: 4, align: "start", alignOffset: -8, children: items.map((item) => /* @__PURE__ */ jsx13(
            Item6,
            {
              onSelect: item.onSelect,
              disabled: item.disabled,
              children: item.label
            },
            item.id
          )) }) })
        ]
      }
    );
  }
);
DropdownMenu.displayName = "DropdownMenu";

// src/tooltip/Tooltip.tsx
import { forwardRef as forwardRef15, isValidElement as isValidElement3 } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { jsx as jsx14, jsxs as jsxs9 } from "react/jsx-runtime";
var Content8 = styled(TooltipPrimitive.Content, {
  base: {
    bg: "tooltip.bg",
    color: "tooltip.text",
    borderRadius: "sm",
    px: "sm",
    py: "xs",
    fontFamily: "brand",
    fontSize: "sm",
    lineHeight: "normal",
    maxWidth: "300px",
    zIndex: "zIndex.tooltip",
    boxShadow: "shadows.soft"
  }
});
var Arrow2 = styled(TooltipPrimitive.Arrow, {
  base: {
    fill: "tooltip.bg"
  }
});
var Tooltip = forwardRef15(
  ({ content, children, side = "top", delayDuration = 200 }, ref) => {
    if (process.env.NODE_ENV !== "production" && !isValidElement3(children)) {
      console.warn(
        "Tooltip: `children` prop must be a single React element. Received:",
        typeof children,
        children
      );
    }
    return /* @__PURE__ */ jsx14(TooltipPrimitive.Provider, { delayDuration, children: /* @__PURE__ */ jsxs9(TooltipPrimitive.Root, { children: [
      /* @__PURE__ */ jsx14(TooltipPrimitive.Trigger, { asChild: true, children }),
      /* @__PURE__ */ jsx14(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsxs9(Content8, { ref, side, sideOffset: 4, children: [
        content,
        /* @__PURE__ */ jsx14(Arrow2, {})
      ] }) })
    ] }) });
  }
);
Tooltip.displayName = "Tooltip";

// src/toast/Toast.tsx
import { forwardRef as forwardRef16 } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { jsx as jsx15, jsxs as jsxs10 } from "react/jsx-runtime";
var Viewport4 = styled(ToastPrimitive.Viewport, {
  base: {
    position: "fixed",
    bottom: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    gap: "md",
    width: "390px",
    maxWidth: "100vw",
    margin: 0,
    padding: "lg",
    listStyle: "none",
    zIndex: "zIndex.toast",
    outline: "none"
  }
});
var Root11 = styled(ToastPrimitive.Root, {
  base: {
    bg: "toast.bg",
    color: "toast.text",
    borderRadius: "component.toastRadius",
    boxShadow: "component.toastShadow",
    padding: "md",
    display: "grid",
    gridTemplateAreas: '"title action" "description action"',
    gridTemplateColumns: "auto max-content",
    columnGap: "md",
    alignItems: "center",
    border: "1px solid",
    borderColor: "toast.border",
    '&[data-state="open"]': {
      animation: "slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)"
    },
    '&[data-state="closed"]': {
      animation: "slideOut 100ms ease-in"
    },
    '&[data-swipe="move"]': {
      transform: "translateX(var(--radix-toast-swipe-move-x))"
    },
    '&[data-swipe="cancel"]': {
      transform: "translateX(0)",
      transition: "transform 200ms ease-out"
    },
    '&[data-swipe="end"]': {
      animation: "swipeOut 100ms ease-out"
    }
  }
});
var Title4 = styled(ToastPrimitive.Title, {
  base: {
    gridArea: "title",
    fontFamily: "brand",
    fontSize: "md",
    fontWeight: "bold",
    color: "toast.text",
    marginBottom: "xs"
  }
});
var Description4 = styled(ToastPrimitive.Description, {
  base: {
    gridArea: "description",
    fontFamily: "brand",
    fontSize: "sm",
    lineHeight: "normal",
    color: "toast.text",
    opacity: 0.9
  }
});
var Close3 = styled(ToastPrimitive.Close, {
  base: {
    gridArea: "action",
    width: "24px",
    height: "24px",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "toast.text",
    cursor: "pointer",
    border: "none",
    bg: "transparent",
    outline: "none",
    transition: "all 0.15s ease",
    opacity: 0.8,
    _hover: {
      opacity: 1,
      bg: "toast.closeHover"
    },
    _focus: {
      boxShadow: "focus.light"
    }
  }
});
var ToastProvider = ({
  children,
  label = "Notification",
  duration = 5e3,
  swipeThreshold = 50
}) => {
  return /* @__PURE__ */ jsxs10(
    ToastPrimitive.Provider,
    {
      label,
      duration,
      swipeThreshold,
      children: [
        children,
        /* @__PURE__ */ jsx15(Viewport4, {})
      ]
    }
  );
};
var Toast = forwardRef16(
  ({
    title,
    description,
    children,
    duration = 5e3,
    open,
    defaultOpen,
    onOpenChange
  }, ref) => {
    return /* @__PURE__ */ jsxs10(
      Root11,
      {
        ref,
        open,
        defaultOpen,
        onOpenChange,
        duration,
        children: [
          title && /* @__PURE__ */ jsx15(Title4, { children: title }),
          description && /* @__PURE__ */ jsx15(Description4, { children: description }),
          children,
          /* @__PURE__ */ jsx15(Close3, { "aria-label": "Close", children: /* @__PURE__ */ jsx15(
            "svg",
            {
              width: "14",
              height: "14",
              viewBox: "0 0 14 14",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx15(
                "path",
                {
                  d: "M11 3L3 11M3 3L11 11",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round"
                }
              )
            }
          ) })
        ]
      }
    );
  }
);
Toast.displayName = "Toast";

// src/progress/Progress.tsx
import { forwardRef as forwardRef17 } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { jsx as jsx16 } from "react/jsx-runtime";
var Root13 = styled(ProgressPrimitive.Root, {
  base: {
    position: "relative",
    overflow: "hidden",
    bg: "progress.bg",
    borderRadius: "pill",
    width: "100%",
    height: "8px",
    transform: "translateZ(0)"
  }
});
var Indicator6 = styled(ProgressPrimitive.Indicator, {
  base: {
    bg: "progress.fill",
    width: "100%",
    height: "100%",
    transition: "transform 0.3s ease",
    '&[data-state="indeterminate"]': {
      animation: "progress-indeterminate 1.5s ease-in-out infinite"
    }
  }
});
var Progress = forwardRef17(
  ({ value, max = 100, indeterminate, "aria-label": ariaLabel }, ref) => {
    const safeValue = Math.min(Math.max(value ?? 0, 0), max);
    const percentage = safeValue / max * 100;
    const progressValue = indeterminate ? void 0 : safeValue;
    return /* @__PURE__ */ jsx16(
      Root13,
      {
        ref,
        value: progressValue,
        max,
        "aria-label": ariaLabel,
        children: /* @__PURE__ */ jsx16(
          Indicator6,
          {
            style: {
              transform: indeterminate ? void 0 : `translateX(-${100 - percentage}%)`
            }
          }
        )
      }
    );
  }
);
Progress.displayName = "Progress";

// src/tabs/Tabs.tsx
import { forwardRef as forwardRef18 } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { jsx as jsx17 } from "react/jsx-runtime";
var Root15 = styled(TabsPrimitive.Root, {
  base: {
    display: "flex",
    flexDirection: "column",
    width: "100%"
  }
});
var List2 = styled(TabsPrimitive.List, {
  base: {
    display: "flex",
    borderBottom: "2px solid",
    borderColor: "border.subtle",
    gap: "sm"
  }
});
var Trigger7 = styled(TabsPrimitive.Trigger, {
  base: {
    all: "unset",
    fontFamily: "brand",
    fontSize: "md",
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "tabs.inactive.text",
    padding: "sm md",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.15s ease",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    outline: "none",
    _hover: {
      bg: "tabs.hover.bg",
      color: "text.primary"
    },
    _focus: {
      boxShadow: "focus.primary"
    },
    _focusVisible: {
      boxShadow: "focus.primary"
    },
    '&[data-state="active"]': {
      color: "tabs.active.text",
      borderBottomColor: "tabs.active.border"
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
      pointerEvents: "none"
    }
  }
});
var Content10 = styled(TabsPrimitive.Content, {
  base: {
    flexGrow: 1,
    padding: "lg",
    outline: "none",
    _focus: {
      boxShadow: "focus.dialog"
    },
    _focusVisible: {
      boxShadow: "focus.dialog"
    }
  }
});
var Tabs = forwardRef18(
  ({ defaultValue, value, onValueChange, children, orientation = "horizontal" }, ref) => {
    return /* @__PURE__ */ jsx17(
      Root15,
      {
        ref,
        defaultValue,
        value,
        onValueChange,
        orientation,
        children
      }
    );
  }
);
Tabs.displayName = "Tabs";
var TabsList = forwardRef18(
  ({ children, "aria-label": ariaLabel }, ref) => {
    return /* @__PURE__ */ jsx17(List2, { ref, "aria-label": ariaLabel, children });
  }
);
TabsList.displayName = "TabsList";
var TabsTrigger = forwardRef18(
  ({ value, children, disabled }, ref) => {
    return /* @__PURE__ */ jsx17(Trigger7, { ref, value, disabled, children });
  }
);
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = forwardRef18(
  ({ value, children }, ref) => {
    return /* @__PURE__ */ jsx17(Content10, { ref, value, children });
  }
);
TabsContent.displayName = "TabsContent";

// src/accordion/Accordion.tsx
import { forwardRef as forwardRef19 } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { jsx as jsx18, jsxs as jsxs11 } from "react/jsx-runtime";
var Root17 = styled(AccordionPrimitive.Root, {
  base: {
    width: "100%",
    border: "1px solid",
    borderColor: "border.subtle",
    borderRadius: "radii.md",
    overflow: "hidden"
  }
});
var Item8 = styled(AccordionPrimitive.Item, {
  base: {
    overflow: "hidden",
    "&:not(:last-child)": {
      borderBottom: "1px solid",
      borderColor: "border.subtle"
    },
    _focus: {
      position: "relative",
      zIndex: 1
    }
  }
});
var Header2 = styled(AccordionPrimitive.Header, {
  base: {
    all: "unset",
    display: "flex"
  }
});
var Trigger9 = styled(AccordionPrimitive.Trigger, {
  base: {
    all: "unset",
    fontFamily: "brand",
    fontSize: "md",
    fontWeight: "medium",
    color: "text.primary",
    padding: "md",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "all 0.15s ease",
    outline: "none",
    _hover: {
      bg: "accordion.trigger.hover"
    },
    _open: {
      bg: "accordion.trigger.hover"
    },
    _focus: {
      boxShadow: "focus.primary"
    },
    _focusVisible: {
      boxShadow: "focus.primary"
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
      pointerEvents: "none"
    }
  }
});
var ChevronIcon = styled("span", {
  base: {
    transition: "transform 0.2s ease",
    display: "inline-flex",
    "[data-state=open] &": {
      transform: "rotate(180deg)"
    }
  }
});
var Content12 = styled(AccordionPrimitive.Content, {
  base: {
    overflow: "hidden",
    fontSize: "sm",
    lineHeight: "normal",
    color: "text.secondary",
    '&[data-state="open"]': {
      animation: "slideDown 200ms cubic-bezier(0.87, 0, 0.13, 1)"
    },
    '&[data-state="closed"]': {
      animation: "slideUp 200ms cubic-bezier(0.87, 0, 0.13, 1)"
    }
  }
});
var ContentInner = styled("div", {
  base: {
    padding: "md"
  }
});
var Accordion = forwardRef19(
  (props, ref) => {
    if (props.type === "multiple") {
      return /* @__PURE__ */ jsx18(
        Root17,
        {
          ref,
          type: "multiple",
          defaultValue: props.defaultValue,
          value: props.value,
          onValueChange: props.onValueChange,
          disabled: props.disabled,
          children: props.children
        }
      );
    }
    return /* @__PURE__ */ jsx18(
      Root17,
      {
        ref,
        type: "single",
        collapsible: props.collapsible ?? false,
        defaultValue: props.defaultValue,
        value: props.value,
        onValueChange: props.onValueChange,
        disabled: props.disabled,
        children: props.children
      }
    );
  }
);
Accordion.displayName = "Accordion";
var AccordionItem = forwardRef19(
  ({ value, children, disabled }, ref) => {
    return /* @__PURE__ */ jsx18(Item8, { ref, value, disabled, children });
  }
);
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = forwardRef19(
  ({ children }, ref) => {
    return /* @__PURE__ */ jsx18(Header2, { children: /* @__PURE__ */ jsxs11(Trigger9, { ref, children: [
      children,
      /* @__PURE__ */ jsx18(ChevronIcon, { "aria-hidden": true, children: /* @__PURE__ */ jsx18(
        "svg",
        {
          width: "15",
          height: "15",
          viewBox: "0 0 15 15",
          fill: "none",
          xmlns: "http://www.w3.org/2000/svg",
          children: /* @__PURE__ */ jsx18(
            "path",
            {
              d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
              fill: "currentColor",
              fillRule: "evenodd",
              clipRule: "evenodd"
            }
          )
        }
      ) })
    ] }) });
  }
);
AccordionTrigger.displayName = "AccordionTrigger";
var AccordionContent = forwardRef19(
  ({ children }, ref) => {
    return /* @__PURE__ */ jsx18(Content12, { ref, children: /* @__PURE__ */ jsx18(ContentInner, { children }) });
  }
);
AccordionContent.displayName = "AccordionContent";

// src/popover/Popover.tsx
import { forwardRef as forwardRef20, isValidElement as isValidElement4 } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { jsx as jsx19, jsxs as jsxs12 } from "react/jsx-runtime";
var Content14 = styled(PopoverPrimitive.Content, {
  base: {
    bg: "background.elevated",
    borderRadius: "component.popoverRadius",
    padding: "md",
    minWidth: "220px",
    maxWidth: "400px",
    border: "1px solid",
    borderColor: "border.subtle",
    boxShadow: "component.popoverShadow",
    zIndex: "zIndex.dropdown",
    outline: "none",
    '&[data-state="open"]': {
      animation: "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)"
    },
    '&[data-state="closed"]': {
      animation: "fadeOut 150ms cubic-bezier(0.16, 1, 0.3, 1)"
    },
    _focus: {
      outline: "none"
    }
  }
});
var Arrow4 = styled(PopoverPrimitive.Arrow, {
  base: {
    fill: "background.elevated"
  }
});
var Close5 = styled(PopoverPrimitive.Close, {
  base: {
    position: "absolute",
    top: "xs",
    right: "xs",
    width: "24px",
    height: "24px",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "text.secondary",
    cursor: "pointer",
    border: "none",
    bg: "transparent",
    outline: "none",
    transition: "all 0.15s ease",
    _hover: {
      bg: "background.subtle",
      color: "text.primary"
    },
    _focus: {
      boxShadow: "focus.primary"
    }
  }
});
var Popover = forwardRef20(
  ({
    trigger,
    children,
    open,
    defaultOpen,
    onOpenChange,
    showArrow = false,
    sideOffset = 4,
    alignOffset = 0
  }, ref) => {
    if (process.env.NODE_ENV !== "production" && trigger && !isValidElement4(trigger)) {
      console.warn(
        "Popover: `trigger` prop must be a single React element. Received:",
        typeof trigger,
        trigger
      );
    }
    return /* @__PURE__ */ jsxs12(
      PopoverPrimitive.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          trigger && /* @__PURE__ */ jsx19(PopoverPrimitive.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsx19(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsxs12(
            Content14,
            {
              ref,
              sideOffset,
              alignOffset,
              children: [
                children,
                showArrow && /* @__PURE__ */ jsx19(Arrow4, {}),
                /* @__PURE__ */ jsx19(Close5, { "aria-label": "Close", children: /* @__PURE__ */ jsx19(
                  "svg",
                  {
                    width: "12",
                    height: "12",
                    viewBox: "0 0 12 12",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                    children: /* @__PURE__ */ jsx19(
                      "path",
                      {
                        d: "M10 2L2 10M2 2L10 10",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        strokeLinecap: "round"
                      }
                    )
                  }
                ) })
              ]
            }
          ) })
        ]
      }
    );
  }
);
Popover.displayName = "Popover";

// src/separator/Separator.tsx
import { forwardRef as forwardRef21 } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { jsx as jsx20 } from "react/jsx-runtime";
var StyledSeparator = styled(SeparatorPrimitive.Root, {
  base: {
    bg: "border.subtle",
    flexShrink: 0,
    '&[data-orientation="horizontal"]': {
      height: "1px",
      width: "100%"
    },
    '&[data-orientation="vertical"]': {
      width: "1px",
      height: "100%"
    }
  }
});
var Separator = forwardRef21(
  ({ orientation = "horizontal", decorative = true, ...props }, ref) => {
    return /* @__PURE__ */ jsx20(
      StyledSeparator,
      {
        ref,
        orientation,
        decorative,
        ...props
      }
    );
  }
);
Separator.displayName = "Separator";

// src/grid/Grid.tsx
import { forwardRef as forwardRef22 } from "react";
import { jsx as jsx21 } from "react/jsx-runtime";
var Grid = forwardRef22(
  ({ columns, gap, columnGap, rowGap, minChildWidth, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx21(
      "div",
      {
        ref,
        className: grid({ columns, gap, columnGap, rowGap, minChildWidth }),
        ...props,
        children
      }
    );
  }
);
Grid.displayName = "Grid";

// src/grid/GridItem.tsx
import { forwardRef as forwardRef23 } from "react";
import { jsx as jsx22 } from "react/jsx-runtime";
var GridItem = forwardRef23(
  ({ colSpan, rowSpan, colStart, rowStart, colEnd, rowEnd, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx22(
      "div",
      {
        ref,
        className: gridItem({ colSpan, rowSpan, colStart, rowStart, colEnd, rowEnd }),
        ...props,
        children
      }
    );
  }
);
GridItem.displayName = "GridItem";

// src/breadcrumbs/Breadcrumbs.tsx
import {
  forwardRef as forwardRef25,
  Children as Children2,
  cloneElement as cloneElement2,
  isValidElement as isValidElement6
} from "react";

// ../../node_modules/@radix-ui/react-slot/dist/index.mjs
import * as React2 from "react";

// ../../node_modules/@radix-ui/react-compose-refs/dist/index.mjs
import * as React from "react";
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}

// ../../node_modules/@radix-ui/react-slot/dist/index.mjs
import { Fragment as Fragment2, jsx as jsx23 } from "react/jsx-runtime";
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = React2.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React2.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React2.Children.count(newElement) > 1) return React2.Children.only(null);
          return React2.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx23(SlotClone, { ...slotProps, ref: forwardedRef, children: React2.isValidElement(newElement) ? React2.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx23(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
var Slot = /* @__PURE__ */ createSlot("Slot");
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = React2.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React2.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps2(slotProps, children.props);
      if (children.type !== React2.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React2.cloneElement(children, props2);
    }
    return React2.Children.count(children) > 1 ? React2.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(child) {
  return React2.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps2(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

// src/breadcrumbs/Breadcrumbs.tsx
import { jsx as jsx24, jsxs as jsxs13 } from "react/jsx-runtime";
var BreadcrumbNav = styled("nav", {
  base: {
    display: "flex",
    alignItems: "center"
  }
});
var BreadcrumbList = styled("ol", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "xs",
    listStyle: "none",
    margin: 0,
    padding: 0,
    flexWrap: "wrap"
  }
});
var Breadcrumbs = forwardRef25(
  ({ separator = "/", children, ...props }, ref) => {
    const items = Children2.toArray(children).filter(isValidElement6);
    return /* @__PURE__ */ jsx24(BreadcrumbNav, { ref, "aria-label": "Breadcrumb", ...props, children: /* @__PURE__ */ jsx24(BreadcrumbList, { children: items.map((child, index) => {
      const isLast = index === items.length - 1;
      return /* @__PURE__ */ jsxs13("li", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
        cloneElement2(child, {
          isCurrentPage: isLast
        }),
        !isLast && /* @__PURE__ */ jsx24(BreadcrumbSeparator, { children: separator })
      ] }, index);
    }) }) });
  }
);
Breadcrumbs.displayName = "Breadcrumbs";
var BreadcrumbItemRoot = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "sm",
    color: "text.subtle",
    '&[aria-current="page"]': {
      color: "text.main",
      fontWeight: "medium"
    }
  }
});
var BreadcrumbItem = forwardRef25(
  ({ isCurrentPage, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx24(
      BreadcrumbItemRoot,
      {
        ref,
        "aria-current": isCurrentPage ? "page" : void 0,
        ...props,
        children
      }
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";
var BreadcrumbAnchor = styled("a", {
  base: {
    color: "text.link",
    textDecoration: "none",
    transition: "color 0.12s ease",
    "&:hover": {
      color: "text.link-hover",
      textDecoration: "underline"
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "accent.primary",
      outlineOffset: "2px",
      borderRadius: "sm"
    }
  }
});
var BreadcrumbLink = forwardRef25(
  ({ asChild, children, ...props }, ref) => {
    if (asChild) {
      return /* @__PURE__ */ jsx24(Slot, { ref, ...props, children });
    }
    return /* @__PURE__ */ jsx24(BreadcrumbAnchor, { ref, ...props, children });
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";
var SeparatorRoot = styled("span", {
  base: {
    color: "neutral.base",
    fontSize: "sm",
    userSelect: "none"
  }
});
var BreadcrumbSeparator = forwardRef25(
  ({ children = "/", ...props }, ref) => {
    return /* @__PURE__ */ jsx24(SeparatorRoot, { ref, "aria-hidden": "true", ...props, children });
  }
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// src/pagination/Pagination.tsx
import { forwardRef as forwardRef26, useMemo as useMemo2 } from "react";

// src/pagination/pagination.recipes.ts
var paginationButtonRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
    height: "36px",
    px: "sm",
    borderRadius: "md",
    fontFamily: "brand",
    fontSize: "sm",
    fontWeight: "medium",
    border: "1px solid",
    borderColor: "border.subtle",
    bg: "bg.base",
    color: "text.main",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.12s ease",
    userSelect: "none",
    _hover: {
      bg: "bg.subtle",
      borderColor: "border.strong"
    },
    _focus: {
      boxShadow: "focus.primary"
    },
    _disabled: {
      opacity: 0.4,
      cursor: "not-allowed",
      pointerEvents: "none"
    }
  },
  variants: {
    isActive: {
      true: {
        bg: "accent.primary",
        borderColor: "accent.primary",
        color: "text.on-dark",
        _hover: {
          bg: "button.primary.bgHover",
          borderColor: "button.primary.bgHover"
        }
      }
    },
    variant: {
      page: {},
      nav: {
        fontWeight: "regular",
        gap: "2xs"
      }
    }
  },
  defaultVariants: {
    isActive: false,
    variant: "page"
  }
});

// src/pagination/Pagination.tsx
import { jsx as jsx25, jsxs as jsxs14 } from "react/jsx-runtime";
var PaginationRoot = styled("nav", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "xs"
  }
});
var EllipsisContainer = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
    height: "36px",
    color: "text.subtle",
    fontSize: "sm",
    userSelect: "none"
  }
});
function usePagination({
  currentPage,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1
}) {
  return useMemo2(() => {
    const range = (start, end) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };
    const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }
    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount);
    const showLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - boundaryCount - 1;
    const firstPages = range(1, boundaryCount);
    const lastPages = range(totalPages - boundaryCount + 1, totalPages);
    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, "ellipsis", ...lastPages];
    }
    if (showLeftEllipsis && !showRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [...firstPages, "ellipsis", ...rightRange];
    }
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [...firstPages, "ellipsis", ...middleRange, "ellipsis", ...lastPages];
  }, [currentPage, totalPages, siblingCount, boundaryCount]);
}
var ChevronLeft = () => /* @__PURE__ */ jsx25("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", children: /* @__PURE__ */ jsx25("path", { d: "M10.53 3.47a.75.75 0 010 1.06L6.56 8l3.97 3.47a.75.75 0 11-1.06 1.06l-4.5-4a.75.75 0 010-1.06l4.5-4a.75.75 0 011.06 0z" }) });
var ChevronRight = () => /* @__PURE__ */ jsx25("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", children: /* @__PURE__ */ jsx25("path", { d: "M5.47 12.53a.75.75 0 010-1.06L9.44 8 5.47 4.53a.75.75 0 011.06-1.06l4.5 4a.75.75 0 010 1.06l-4.5 4a.75.75 0 01-1.06 0z" }) });
var ChevronsLeft = () => /* @__PURE__ */ jsx25("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", children: /* @__PURE__ */ jsx25("path", { d: "M8.53 3.47a.75.75 0 010 1.06L4.56 8l3.97 3.47a.75.75 0 11-1.06 1.06l-4.5-4a.75.75 0 010-1.06l4.5-4a.75.75 0 011.06 0zm5 0a.75.75 0 010 1.06L9.56 8l3.97 3.47a.75.75 0 11-1.06 1.06l-4.5-4a.75.75 0 010-1.06l4.5-4a.75.75 0 011.06 0z" }) });
var ChevronsRight = () => /* @__PURE__ */ jsx25("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", children: /* @__PURE__ */ jsx25("path", { d: "M3.47 12.53a.75.75 0 010-1.06L7.44 8 3.47 4.53a.75.75 0 011.06-1.06l4.5 4a.75.75 0 010 1.06l-4.5 4a.75.75 0 01-1.06 0zm5 0a.75.75 0 010-1.06L12.44 8 8.47 4.53a.75.75 0 011.06-1.06l4.5 4a.75.75 0 010 1.06l-4.5 4a.75.75 0 01-1.06 0z" }) });
var PaginationButton = forwardRef26(
  ({ isActive, disabled, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx25(
      "button",
      {
        ref,
        type: "button",
        className: paginationButtonRecipe({ isActive, variant: "page" }),
        disabled,
        "aria-current": isActive ? "page" : void 0,
        ...props,
        children
      }
    );
  }
);
PaginationButton.displayName = "PaginationButton";
var PaginationEllipsis = forwardRef26(
  (props, ref) => {
    return /* @__PURE__ */ jsx25(EllipsisContainer, { ref, "aria-hidden": "true", ...props, children: "..." });
  }
);
PaginationEllipsis.displayName = "PaginationEllipsis";
var Pagination = forwardRef26(
  ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    showFirstLast = false,
    ...props
  }, ref) => {
    const pages = usePagination({ currentPage, totalPages, siblingCount, boundaryCount });
    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    };
    return /* @__PURE__ */ jsxs14(PaginationRoot, { ref, "aria-label": "Pagination", ...props, children: [
      showFirstLast && /* @__PURE__ */ jsx25(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(1),
          disabled: currentPage === 1,
          "aria-label": "Go to first page",
          children: /* @__PURE__ */ jsx25(ChevronsLeft, {})
        }
      ),
      /* @__PURE__ */ jsx25(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(currentPage - 1),
          disabled: currentPage === 1,
          "aria-label": "Go to previous page",
          children: /* @__PURE__ */ jsx25(ChevronLeft, {})
        }
      ),
      pages.map(
        (page, index) => page === "ellipsis" ? /* @__PURE__ */ jsx25(PaginationEllipsis, {}, `ellipsis-${index}`) : /* @__PURE__ */ jsx25(
          PaginationButton,
          {
            isActive: page === currentPage,
            onClick: () => handlePageChange(page),
            "aria-label": `Go to page ${page}`,
            children: page
          },
          page
        )
      ),
      /* @__PURE__ */ jsx25(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(currentPage + 1),
          disabled: currentPage === totalPages,
          "aria-label": "Go to next page",
          children: /* @__PURE__ */ jsx25(ChevronRight, {})
        }
      ),
      showFirstLast && /* @__PURE__ */ jsx25(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(totalPages),
          disabled: currentPage === totalPages,
          "aria-label": "Go to last page",
          children: /* @__PURE__ */ jsx25(ChevronsRight, {})
        }
      )
    ] });
  }
);
Pagination.displayName = "Pagination";

// src/side-panel/SidePanel.tsx
import { forwardRef as forwardRef27, isValidElement as isValidElement7 } from "react";
import * as DialogPrimitive2 from "@radix-ui/react-dialog";

// src/side-panel/side-panel.recipes.ts
var sidePanelContentRecipe = cva({
  base: {
    bg: "background.elevated",
    boxShadow: "component.modalShadow",
    position: "fixed",
    top: "0",
    bottom: "0",
    display: "flex",
    flexDirection: "column",
    zIndex: "zIndex.modal",
    outline: "none",
    overflow: "hidden",
    _focus: {
      outline: "none"
    }
  },
  variants: {
    side: {
      left: {
        left: "0",
        borderRight: "1px solid",
        borderColor: "border.subtle",
        '&[data-state="open"]': {
          animation: "slideInFromLeft 0.2s ease-out"
        },
        '&[data-state="closed"]': {
          animation: "slideOutToLeft 0.15s ease-in"
        }
      },
      right: {
        right: "0",
        borderLeft: "1px solid",
        borderColor: "border.subtle",
        '&[data-state="open"]': {
          animation: "slideInFromRight 0.2s ease-out"
        },
        '&[data-state="closed"]': {
          animation: "slideOutToRight 0.15s ease-in"
        }
      }
    },
    size: {
      sm: {
        width: "320px",
        maxWidth: "90vw"
      },
      md: {
        width: "480px",
        maxWidth: "90vw"
      },
      lg: {
        width: "640px",
        maxWidth: "90vw"
      },
      full: {
        width: "100vw"
      }
    }
  },
  defaultVariants: {
    side: "right",
    size: "md"
  }
});

// src/side-panel/SidePanel.tsx
import { jsx as jsx26, jsxs as jsxs15 } from "react/jsx-runtime";
var Overlay4 = styled(DialogPrimitive2.Overlay, {
  base: {
    bg: "overlay.modal",
    position: "fixed",
    inset: "0",
    zIndex: "zIndex.modal",
    '&[data-state="open"]': {
      animation: "overlayShow 0.2s ease-out"
    },
    '&[data-state="closed"]': {
      animation: "overlayHide 0.15s ease-in"
    }
  }
});
var Header3 = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "xs",
    padding: "lg",
    borderBottom: "1px solid",
    borderColor: "border.subtle",
    flexShrink: 0
  }
});
var Title6 = styled(DialogPrimitive2.Title, {
  base: {
    fontFamily: "brand",
    fontSize: "xl",
    fontWeight: "bold",
    color: "text.primary",
    margin: 0,
    paddingRight: "xl"
  }
});
var Description6 = styled(DialogPrimitive2.Description, {
  base: {
    fontFamily: "brand",
    fontSize: "sm",
    lineHeight: "normal",
    color: "text.secondary",
    margin: 0
  }
});
var Body = styled("div", {
  base: {
    flex: 1,
    padding: "lg",
    overflowY: "auto"
  }
});
var CloseButton2 = styled(DialogPrimitive2.Close, {
  base: {
    position: "absolute",
    top: "md",
    right: "md",
    width: "32px",
    height: "32px",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "text.secondary",
    cursor: "pointer",
    border: "none",
    bg: "transparent",
    outline: "none",
    transition: "all 0.15s ease",
    zIndex: 1,
    _hover: {
      bg: "background.subtle",
      color: "text.primary"
    },
    _focus: {
      boxShadow: "focus.dialog"
    }
  }
});
var SidePanel = forwardRef27(
  ({
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    side = "right",
    size = "md",
    title,
    description,
    children
  }, ref) => {
    if (process.env.NODE_ENV !== "production" && trigger && !isValidElement7(trigger)) {
      console.warn(
        "SidePanel: `trigger` prop must be a single React element. Received:",
        typeof trigger,
        trigger
      );
    }
    return /* @__PURE__ */ jsxs15(
      DialogPrimitive2.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          trigger && /* @__PURE__ */ jsx26(DialogPrimitive2.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsxs15(DialogPrimitive2.Portal, { children: [
            /* @__PURE__ */ jsx26(Overlay4, {}),
            /* @__PURE__ */ jsxs15(
              DialogPrimitive2.Content,
              {
                ref,
                className: sidePanelContentRecipe({ side, size }),
                children: [
                  /* @__PURE__ */ jsx26(CloseButton2, { "aria-label": "Close panel", children: /* @__PURE__ */ jsx26(
                    "svg",
                    {
                      width: "16",
                      height: "16",
                      viewBox: "0 0 16 16",
                      fill: "none",
                      xmlns: "http://www.w3.org/2000/svg",
                      children: /* @__PURE__ */ jsx26(
                        "path",
                        {
                          d: "M12 4L4 12M4 4L12 12",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          strokeLinecap: "round"
                        }
                      )
                    }
                  ) }),
                  (title || description) && /* @__PURE__ */ jsxs15(Header3, { children: [
                    title && /* @__PURE__ */ jsx26(Title6, { children: title }),
                    description && /* @__PURE__ */ jsx26(Description6, { children: description })
                  ] }),
                  /* @__PURE__ */ jsx26(Body, { children })
                ]
              }
            )
          ] })
        ]
      }
    );
  }
);
SidePanel.displayName = "SidePanel";

// src/table/Table.tsx
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { forwardRef as forwardRef28, useEffect, useState } from "react";
import { jsx as jsx27, jsxs as jsxs16 } from "react/jsx-runtime";
var TableContainer = styled("div", {
  base: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "component.cardRadius",
    border: "1px solid",
    borderColor: "border.subtle"
  }
});
var StyledTable = styled("table", {
  base: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "brand",
    fontSize: "md",
    lineHeight: "normal"
  }
});
var TableHead = styled("thead", {
  base: {
    bg: "background.subtle",
    borderBottom: "2px solid",
    borderColor: "border.strong"
  }
});
var TableHeaderCell = styled("th", {
  base: {
    px: "md",
    py: "sm",
    textAlign: "left",
    fontFamily: "brand",
    fontWeight: "medium",
    color: "text.primary",
    fontSize: "sm",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    userSelect: "none",
    transition: "all 0.15s ease",
    _hover: {
      bg: "background.elevated"
    }
  },
  variants: {
    sortable: {
      true: {
        cursor: "pointer"
      },
      false: {
        cursor: "default"
      }
    }
  }
});
var HeaderCellContent = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "xs"
  }
});
var TableBody = styled("tbody", {
  base: {}
});
var TableRow = styled("tr", {
  base: {
    borderBottom: "1px solid",
    borderColor: "border.subtle",
    transition: "all 0.15s ease",
    _hover: {
      bg: "background.subtle"
    },
    '&[data-selected="true"]': {
      bg: "selection.bg"
    }
  }
});
var TableCell = styled("td", {
  base: {
    px: "md",
    py: "sm",
    color: "text.primary"
  }
});
function TableComponent({
  columns,
  data,
  enableRowSelection = false,
  onRowSelectionChange
}, ref) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection
  });
  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);
  return /* @__PURE__ */ jsx27(TableContainer, { ref, children: /* @__PURE__ */ jsxs16(StyledTable, { children: [
    /* @__PURE__ */ jsx27(TableHead, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx27("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx27(
      TableHeaderCell,
      {
        onClick: header.column.getToggleSortingHandler(),
        sortable: header.column.getCanSort(),
        children: header.isPlaceholder ? null : /* @__PURE__ */ jsxs16(HeaderCellContent, { children: [
          flexRender(
            header.column.columnDef.header,
            header.getContext()
          ),
          header.column.getIsSorted() && /* @__PURE__ */ jsx27("span", { children: header.column.getIsSorted() === "asc" ? "\u2191" : "\u2193" })
        ] })
      },
      header.id
    )) }, headerGroup.id)) }),
    /* @__PURE__ */ jsx27(TableBody, { children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx27(
      TableRow,
      {
        "data-selected": row.getIsSelected(),
        children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx27(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
      },
      row.id
    )) })
  ] }) });
}
TableComponent.displayName = "Table";
var Table = forwardRef28(TableComponent);

// src/event-calendar/EventCalendar.tsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { forwardRef as forwardRef29 } from "react";

// styled-system/tokens/index.mjs
var tokens = {
  "aspectRatios.square": {
    "value": "1 / 1",
    "variable": "var(--aspect-ratios-square)"
  },
  "aspectRatios.landscape": {
    "value": "4 / 3",
    "variable": "var(--aspect-ratios-landscape)"
  },
  "aspectRatios.portrait": {
    "value": "3 / 4",
    "variable": "var(--aspect-ratios-portrait)"
  },
  "aspectRatios.wide": {
    "value": "16 / 9",
    "variable": "var(--aspect-ratios-wide)"
  },
  "aspectRatios.ultrawide": {
    "value": "18 / 5",
    "variable": "var(--aspect-ratios-ultrawide)"
  },
  "aspectRatios.golden": {
    "value": "1.618 / 1",
    "variable": "var(--aspect-ratios-golden)"
  },
  "borders.none": {
    "value": "none",
    "variable": "var(--borders-none)"
  },
  "easings.default": {
    "value": "cubic-bezier(0.4, 0, 0.2, 1)",
    "variable": "var(--easings-default)"
  },
  "easings.linear": {
    "value": "linear",
    "variable": "var(--easings-linear)"
  },
  "easings.in": {
    "value": "cubic-bezier(0.4, 0, 1, 1)",
    "variable": "var(--easings-in)"
  },
  "easings.out": {
    "value": "cubic-bezier(0, 0, 0.2, 1)",
    "variable": "var(--easings-out)"
  },
  "easings.in-out": {
    "value": "cubic-bezier(0.4, 0, 0.2, 1)",
    "variable": "var(--easings-in-out)"
  },
  "letterSpacings.tighter": {
    "value": "-0.05em",
    "variable": "var(--letter-spacings-tighter)"
  },
  "letterSpacings.tight": {
    "value": "-0.025em",
    "variable": "var(--letter-spacings-tight)"
  },
  "letterSpacings.normal": {
    "value": "0em",
    "variable": "var(--letter-spacings-normal)"
  },
  "letterSpacings.wide": {
    "value": "0.025em",
    "variable": "var(--letter-spacings-wide)"
  },
  "letterSpacings.wider": {
    "value": "0.05em",
    "variable": "var(--letter-spacings-wider)"
  },
  "letterSpacings.widest": {
    "value": "0.1em",
    "variable": "var(--letter-spacings-widest)"
  },
  "blurs.xs": {
    "value": "4px",
    "variable": "var(--blurs-xs)"
  },
  "blurs.sm": {
    "value": "8px",
    "variable": "var(--blurs-sm)"
  },
  "blurs.md": {
    "value": "12px",
    "variable": "var(--blurs-md)"
  },
  "blurs.lg": {
    "value": "16px",
    "variable": "var(--blurs-lg)"
  },
  "blurs.xl": {
    "value": "24px",
    "variable": "var(--blurs-xl)"
  },
  "blurs.2xl": {
    "value": "40px",
    "variable": "var(--blurs-2xl)"
  },
  "blurs.3xl": {
    "value": "64px",
    "variable": "var(--blurs-3xl)"
  },
  "animations.spin": {
    "value": "spin 1s linear infinite",
    "variable": "var(--animations-spin)"
  },
  "animations.ping": {
    "value": "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
    "variable": "var(--animations-ping)"
  },
  "animations.pulse": {
    "value": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "variable": "var(--animations-pulse)"
  },
  "animations.bounce": {
    "value": "bounce 1s infinite",
    "variable": "var(--animations-bounce)"
  },
  "fonts.sans": {
    "value": 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    "variable": "var(--fonts-sans)"
  },
  "fonts.serif": {
    "value": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    "variable": "var(--fonts-serif)"
  },
  "fonts.mono": {
    "value": 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    "variable": "var(--fonts-mono)"
  },
  "fonts.brand": {
    "value": '"Benton Sans", "Work Sans", "Trebuchet MS", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    "variable": "var(--fonts-brand)"
  },
  "colors.current": {
    "value": "currentColor",
    "variable": "var(--colors-current)"
  },
  "colors.black": {
    "value": "#000",
    "variable": "var(--colors-black)"
  },
  "colors.white": {
    "value": "#fff",
    "variable": "var(--colors-white)"
  },
  "colors.transparent": {
    "value": "rgb(0 0 0 / 0)",
    "variable": "var(--colors-transparent)"
  },
  "colors.rose.50": {
    "value": "#fff1f2",
    "variable": "var(--colors-rose-50)"
  },
  "colors.rose.100": {
    "value": "#ffe4e6",
    "variable": "var(--colors-rose-100)"
  },
  "colors.rose.200": {
    "value": "#fecdd3",
    "variable": "var(--colors-rose-200)"
  },
  "colors.rose.300": {
    "value": "#fda4af",
    "variable": "var(--colors-rose-300)"
  },
  "colors.rose.400": {
    "value": "#fb7185",
    "variable": "var(--colors-rose-400)"
  },
  "colors.rose.500": {
    "value": "#f43f5e",
    "variable": "var(--colors-rose-500)"
  },
  "colors.rose.600": {
    "value": "#e11d48",
    "variable": "var(--colors-rose-600)"
  },
  "colors.rose.700": {
    "value": "#be123c",
    "variable": "var(--colors-rose-700)"
  },
  "colors.rose.800": {
    "value": "#9f1239",
    "variable": "var(--colors-rose-800)"
  },
  "colors.rose.900": {
    "value": "#881337",
    "variable": "var(--colors-rose-900)"
  },
  "colors.rose.950": {
    "value": "#4c0519",
    "variable": "var(--colors-rose-950)"
  },
  "colors.pink.50": {
    "value": "#fdf2f8",
    "variable": "var(--colors-pink-50)"
  },
  "colors.pink.100": {
    "value": "#fce7f3",
    "variable": "var(--colors-pink-100)"
  },
  "colors.pink.200": {
    "value": "#fbcfe8",
    "variable": "var(--colors-pink-200)"
  },
  "colors.pink.300": {
    "value": "#f9a8d4",
    "variable": "var(--colors-pink-300)"
  },
  "colors.pink.400": {
    "value": "#f472b6",
    "variable": "var(--colors-pink-400)"
  },
  "colors.pink.500": {
    "value": "#ec4899",
    "variable": "var(--colors-pink-500)"
  },
  "colors.pink.600": {
    "value": "#db2777",
    "variable": "var(--colors-pink-600)"
  },
  "colors.pink.700": {
    "value": "#be185d",
    "variable": "var(--colors-pink-700)"
  },
  "colors.pink.800": {
    "value": "#9d174d",
    "variable": "var(--colors-pink-800)"
  },
  "colors.pink.900": {
    "value": "#831843",
    "variable": "var(--colors-pink-900)"
  },
  "colors.pink.950": {
    "value": "#500724",
    "variable": "var(--colors-pink-950)"
  },
  "colors.fuchsia.50": {
    "value": "#fdf4ff",
    "variable": "var(--colors-fuchsia-50)"
  },
  "colors.fuchsia.100": {
    "value": "#fae8ff",
    "variable": "var(--colors-fuchsia-100)"
  },
  "colors.fuchsia.200": {
    "value": "#f5d0fe",
    "variable": "var(--colors-fuchsia-200)"
  },
  "colors.fuchsia.300": {
    "value": "#f0abfc",
    "variable": "var(--colors-fuchsia-300)"
  },
  "colors.fuchsia.400": {
    "value": "#e879f9",
    "variable": "var(--colors-fuchsia-400)"
  },
  "colors.fuchsia.500": {
    "value": "#d946ef",
    "variable": "var(--colors-fuchsia-500)"
  },
  "colors.fuchsia.600": {
    "value": "#c026d3",
    "variable": "var(--colors-fuchsia-600)"
  },
  "colors.fuchsia.700": {
    "value": "#a21caf",
    "variable": "var(--colors-fuchsia-700)"
  },
  "colors.fuchsia.800": {
    "value": "#86198f",
    "variable": "var(--colors-fuchsia-800)"
  },
  "colors.fuchsia.900": {
    "value": "#701a75",
    "variable": "var(--colors-fuchsia-900)"
  },
  "colors.fuchsia.950": {
    "value": "#4a044e",
    "variable": "var(--colors-fuchsia-950)"
  },
  "colors.purple.50": {
    "value": "#faf5ff",
    "variable": "var(--colors-purple-50)"
  },
  "colors.purple.100": {
    "value": "#f3e8ff",
    "variable": "var(--colors-purple-100)"
  },
  "colors.purple.200": {
    "value": "#e9d5ff",
    "variable": "var(--colors-purple-200)"
  },
  "colors.purple.300": {
    "value": "#d8b4fe",
    "variable": "var(--colors-purple-300)"
  },
  "colors.purple.400": {
    "value": "#c084fc",
    "variable": "var(--colors-purple-400)"
  },
  "colors.purple.500": {
    "value": "#a855f7",
    "variable": "var(--colors-purple-500)"
  },
  "colors.purple.600": {
    "value": "#9333ea",
    "variable": "var(--colors-purple-600)"
  },
  "colors.purple.700": {
    "value": "#7e22ce",
    "variable": "var(--colors-purple-700)"
  },
  "colors.purple.800": {
    "value": "#6b21a8",
    "variable": "var(--colors-purple-800)"
  },
  "colors.purple.900": {
    "value": "#581c87",
    "variable": "var(--colors-purple-900)"
  },
  "colors.purple.950": {
    "value": "#3b0764",
    "variable": "var(--colors-purple-950)"
  },
  "colors.violet.50": {
    "value": "#f5f3ff",
    "variable": "var(--colors-violet-50)"
  },
  "colors.violet.100": {
    "value": "#ede9fe",
    "variable": "var(--colors-violet-100)"
  },
  "colors.violet.200": {
    "value": "#ddd6fe",
    "variable": "var(--colors-violet-200)"
  },
  "colors.violet.300": {
    "value": "#c4b5fd",
    "variable": "var(--colors-violet-300)"
  },
  "colors.violet.400": {
    "value": "#a78bfa",
    "variable": "var(--colors-violet-400)"
  },
  "colors.violet.500": {
    "value": "#8b5cf6",
    "variable": "var(--colors-violet-500)"
  },
  "colors.violet.600": {
    "value": "#7c3aed",
    "variable": "var(--colors-violet-600)"
  },
  "colors.violet.700": {
    "value": "#6d28d9",
    "variable": "var(--colors-violet-700)"
  },
  "colors.violet.800": {
    "value": "#5b21b6",
    "variable": "var(--colors-violet-800)"
  },
  "colors.violet.900": {
    "value": "#4c1d95",
    "variable": "var(--colors-violet-900)"
  },
  "colors.violet.950": {
    "value": "#2e1065",
    "variable": "var(--colors-violet-950)"
  },
  "colors.indigo.50": {
    "value": "#eef2ff",
    "variable": "var(--colors-indigo-50)"
  },
  "colors.indigo.100": {
    "value": "#e0e7ff",
    "variable": "var(--colors-indigo-100)"
  },
  "colors.indigo.200": {
    "value": "#c7d2fe",
    "variable": "var(--colors-indigo-200)"
  },
  "colors.indigo.300": {
    "value": "#a5b4fc",
    "variable": "var(--colors-indigo-300)"
  },
  "colors.indigo.400": {
    "value": "#818cf8",
    "variable": "var(--colors-indigo-400)"
  },
  "colors.indigo.500": {
    "value": "#6366f1",
    "variable": "var(--colors-indigo-500)"
  },
  "colors.indigo.600": {
    "value": "#4f46e5",
    "variable": "var(--colors-indigo-600)"
  },
  "colors.indigo.700": {
    "value": "#4338ca",
    "variable": "var(--colors-indigo-700)"
  },
  "colors.indigo.800": {
    "value": "#3730a3",
    "variable": "var(--colors-indigo-800)"
  },
  "colors.indigo.900": {
    "value": "#312e81",
    "variable": "var(--colors-indigo-900)"
  },
  "colors.indigo.950": {
    "value": "#1e1b4b",
    "variable": "var(--colors-indigo-950)"
  },
  "colors.blue.50": {
    "value": "#eff6ff",
    "variable": "var(--colors-blue-50)"
  },
  "colors.blue.100": {
    "value": "#dbeafe",
    "variable": "var(--colors-blue-100)"
  },
  "colors.blue.200": {
    "value": "#bfdbfe",
    "variable": "var(--colors-blue-200)"
  },
  "colors.blue.300": {
    "value": "#93c5fd",
    "variable": "var(--colors-blue-300)"
  },
  "colors.blue.400": {
    "value": "#60a5fa",
    "variable": "var(--colors-blue-400)"
  },
  "colors.blue.500": {
    "value": "#3b82f6",
    "variable": "var(--colors-blue-500)"
  },
  "colors.blue.600": {
    "value": "#2563eb",
    "variable": "var(--colors-blue-600)"
  },
  "colors.blue.700": {
    "value": "#1d4ed8",
    "variable": "var(--colors-blue-700)"
  },
  "colors.blue.800": {
    "value": "#1e40af",
    "variable": "var(--colors-blue-800)"
  },
  "colors.blue.900": {
    "value": "#1e3a8a",
    "variable": "var(--colors-blue-900)"
  },
  "colors.blue.950": {
    "value": "#172554",
    "variable": "var(--colors-blue-950)"
  },
  "colors.sky.50": {
    "value": "#f0f9ff",
    "variable": "var(--colors-sky-50)"
  },
  "colors.sky.100": {
    "value": "#e0f2fe",
    "variable": "var(--colors-sky-100)"
  },
  "colors.sky.200": {
    "value": "#bae6fd",
    "variable": "var(--colors-sky-200)"
  },
  "colors.sky.300": {
    "value": "#7dd3fc",
    "variable": "var(--colors-sky-300)"
  },
  "colors.sky.400": {
    "value": "#38bdf8",
    "variable": "var(--colors-sky-400)"
  },
  "colors.sky.500": {
    "value": "#0ea5e9",
    "variable": "var(--colors-sky-500)"
  },
  "colors.sky.600": {
    "value": "#0284c7",
    "variable": "var(--colors-sky-600)"
  },
  "colors.sky.700": {
    "value": "#0369a1",
    "variable": "var(--colors-sky-700)"
  },
  "colors.sky.800": {
    "value": "#075985",
    "variable": "var(--colors-sky-800)"
  },
  "colors.sky.900": {
    "value": "#0c4a6e",
    "variable": "var(--colors-sky-900)"
  },
  "colors.sky.950": {
    "value": "#082f49",
    "variable": "var(--colors-sky-950)"
  },
  "colors.cyan.50": {
    "value": "#ecfeff",
    "variable": "var(--colors-cyan-50)"
  },
  "colors.cyan.100": {
    "value": "#cffafe",
    "variable": "var(--colors-cyan-100)"
  },
  "colors.cyan.200": {
    "value": "#a5f3fc",
    "variable": "var(--colors-cyan-200)"
  },
  "colors.cyan.300": {
    "value": "#67e8f9",
    "variable": "var(--colors-cyan-300)"
  },
  "colors.cyan.400": {
    "value": "#22d3ee",
    "variable": "var(--colors-cyan-400)"
  },
  "colors.cyan.500": {
    "value": "#06b6d4",
    "variable": "var(--colors-cyan-500)"
  },
  "colors.cyan.600": {
    "value": "#0891b2",
    "variable": "var(--colors-cyan-600)"
  },
  "colors.cyan.700": {
    "value": "#0e7490",
    "variable": "var(--colors-cyan-700)"
  },
  "colors.cyan.800": {
    "value": "#155e75",
    "variable": "var(--colors-cyan-800)"
  },
  "colors.cyan.900": {
    "value": "#164e63",
    "variable": "var(--colors-cyan-900)"
  },
  "colors.cyan.950": {
    "value": "#083344",
    "variable": "var(--colors-cyan-950)"
  },
  "colors.teal.50": {
    "value": "#f0fdfa",
    "variable": "var(--colors-teal-50)"
  },
  "colors.teal.100": {
    "value": "#ccfbf1",
    "variable": "var(--colors-teal-100)"
  },
  "colors.teal.200": {
    "value": "#99f6e4",
    "variable": "var(--colors-teal-200)"
  },
  "colors.teal.300": {
    "value": "#5eead4",
    "variable": "var(--colors-teal-300)"
  },
  "colors.teal.400": {
    "value": "#2dd4bf",
    "variable": "var(--colors-teal-400)"
  },
  "colors.teal.500": {
    "value": "#14b8a6",
    "variable": "var(--colors-teal-500)"
  },
  "colors.teal.600": {
    "value": "#0d9488",
    "variable": "var(--colors-teal-600)"
  },
  "colors.teal.700": {
    "value": "#0f766e",
    "variable": "var(--colors-teal-700)"
  },
  "colors.teal.800": {
    "value": "#115e59",
    "variable": "var(--colors-teal-800)"
  },
  "colors.teal.900": {
    "value": "#134e4a",
    "variable": "var(--colors-teal-900)"
  },
  "colors.teal.950": {
    "value": "#042f2e",
    "variable": "var(--colors-teal-950)"
  },
  "colors.emerald.50": {
    "value": "#ecfdf5",
    "variable": "var(--colors-emerald-50)"
  },
  "colors.emerald.100": {
    "value": "#d1fae5",
    "variable": "var(--colors-emerald-100)"
  },
  "colors.emerald.200": {
    "value": "#a7f3d0",
    "variable": "var(--colors-emerald-200)"
  },
  "colors.emerald.300": {
    "value": "#6ee7b7",
    "variable": "var(--colors-emerald-300)"
  },
  "colors.emerald.400": {
    "value": "#34d399",
    "variable": "var(--colors-emerald-400)"
  },
  "colors.emerald.500": {
    "value": "#10b981",
    "variable": "var(--colors-emerald-500)"
  },
  "colors.emerald.600": {
    "value": "#059669",
    "variable": "var(--colors-emerald-600)"
  },
  "colors.emerald.700": {
    "value": "#047857",
    "variable": "var(--colors-emerald-700)"
  },
  "colors.emerald.800": {
    "value": "#065f46",
    "variable": "var(--colors-emerald-800)"
  },
  "colors.emerald.900": {
    "value": "#064e3b",
    "variable": "var(--colors-emerald-900)"
  },
  "colors.emerald.950": {
    "value": "#022c22",
    "variable": "var(--colors-emerald-950)"
  },
  "colors.green.50": {
    "value": "#f0fdf4",
    "variable": "var(--colors-green-50)"
  },
  "colors.green.100": {
    "value": "#dcfce7",
    "variable": "var(--colors-green-100)"
  },
  "colors.green.200": {
    "value": "#bbf7d0",
    "variable": "var(--colors-green-200)"
  },
  "colors.green.300": {
    "value": "#86efac",
    "variable": "var(--colors-green-300)"
  },
  "colors.green.400": {
    "value": "#4ade80",
    "variable": "var(--colors-green-400)"
  },
  "colors.green.500": {
    "value": "#22c55e",
    "variable": "var(--colors-green-500)"
  },
  "colors.green.600": {
    "value": "#16a34a",
    "variable": "var(--colors-green-600)"
  },
  "colors.green.700": {
    "value": "#15803d",
    "variable": "var(--colors-green-700)"
  },
  "colors.green.800": {
    "value": "#166534",
    "variable": "var(--colors-green-800)"
  },
  "colors.green.900": {
    "value": "#14532d",
    "variable": "var(--colors-green-900)"
  },
  "colors.green.950": {
    "value": "#052e16",
    "variable": "var(--colors-green-950)"
  },
  "colors.lime.50": {
    "value": "#f7fee7",
    "variable": "var(--colors-lime-50)"
  },
  "colors.lime.100": {
    "value": "#ecfccb",
    "variable": "var(--colors-lime-100)"
  },
  "colors.lime.200": {
    "value": "#d9f99d",
    "variable": "var(--colors-lime-200)"
  },
  "colors.lime.300": {
    "value": "#bef264",
    "variable": "var(--colors-lime-300)"
  },
  "colors.lime.400": {
    "value": "#a3e635",
    "variable": "var(--colors-lime-400)"
  },
  "colors.lime.500": {
    "value": "#84cc16",
    "variable": "var(--colors-lime-500)"
  },
  "colors.lime.600": {
    "value": "#65a30d",
    "variable": "var(--colors-lime-600)"
  },
  "colors.lime.700": {
    "value": "#4d7c0f",
    "variable": "var(--colors-lime-700)"
  },
  "colors.lime.800": {
    "value": "#3f6212",
    "variable": "var(--colors-lime-800)"
  },
  "colors.lime.900": {
    "value": "#365314",
    "variable": "var(--colors-lime-900)"
  },
  "colors.lime.950": {
    "value": "#1a2e05",
    "variable": "var(--colors-lime-950)"
  },
  "colors.yellow.50": {
    "value": "#fefce8",
    "variable": "var(--colors-yellow-50)"
  },
  "colors.yellow.100": {
    "value": "#fef9c3",
    "variable": "var(--colors-yellow-100)"
  },
  "colors.yellow.200": {
    "value": "#fef08a",
    "variable": "var(--colors-yellow-200)"
  },
  "colors.yellow.300": {
    "value": "#fde047",
    "variable": "var(--colors-yellow-300)"
  },
  "colors.yellow.400": {
    "value": "#facc15",
    "variable": "var(--colors-yellow-400)"
  },
  "colors.yellow.500": {
    "value": "#eab308",
    "variable": "var(--colors-yellow-500)"
  },
  "colors.yellow.600": {
    "value": "#ca8a04",
    "variable": "var(--colors-yellow-600)"
  },
  "colors.yellow.700": {
    "value": "#a16207",
    "variable": "var(--colors-yellow-700)"
  },
  "colors.yellow.800": {
    "value": "#854d0e",
    "variable": "var(--colors-yellow-800)"
  },
  "colors.yellow.900": {
    "value": "#713f12",
    "variable": "var(--colors-yellow-900)"
  },
  "colors.yellow.950": {
    "value": "#422006",
    "variable": "var(--colors-yellow-950)"
  },
  "colors.amber.50": {
    "value": "#fffbeb",
    "variable": "var(--colors-amber-50)"
  },
  "colors.amber.100": {
    "value": "#fef3c7",
    "variable": "var(--colors-amber-100)"
  },
  "colors.amber.200": {
    "value": "#fde68a",
    "variable": "var(--colors-amber-200)"
  },
  "colors.amber.300": {
    "value": "#fcd34d",
    "variable": "var(--colors-amber-300)"
  },
  "colors.amber.400": {
    "value": "#fbbf24",
    "variable": "var(--colors-amber-400)"
  },
  "colors.amber.500": {
    "value": "#f59e0b",
    "variable": "var(--colors-amber-500)"
  },
  "colors.amber.600": {
    "value": "#d97706",
    "variable": "var(--colors-amber-600)"
  },
  "colors.amber.700": {
    "value": "#b45309",
    "variable": "var(--colors-amber-700)"
  },
  "colors.amber.800": {
    "value": "#92400e",
    "variable": "var(--colors-amber-800)"
  },
  "colors.amber.900": {
    "value": "#78350f",
    "variable": "var(--colors-amber-900)"
  },
  "colors.amber.950": {
    "value": "#451a03",
    "variable": "var(--colors-amber-950)"
  },
  "colors.orange.50": {
    "value": "#fff7ed",
    "variable": "var(--colors-orange-50)"
  },
  "colors.orange.100": {
    "value": "#ffedd5",
    "variable": "var(--colors-orange-100)"
  },
  "colors.orange.200": {
    "value": "#fed7aa",
    "variable": "var(--colors-orange-200)"
  },
  "colors.orange.300": {
    "value": "#fdba74",
    "variable": "var(--colors-orange-300)"
  },
  "colors.orange.400": {
    "value": "#fb923c",
    "variable": "var(--colors-orange-400)"
  },
  "colors.orange.500": {
    "value": "#f97316",
    "variable": "var(--colors-orange-500)"
  },
  "colors.orange.600": {
    "value": "#ea580c",
    "variable": "var(--colors-orange-600)"
  },
  "colors.orange.700": {
    "value": "#c2410c",
    "variable": "var(--colors-orange-700)"
  },
  "colors.orange.800": {
    "value": "#9a3412",
    "variable": "var(--colors-orange-800)"
  },
  "colors.orange.900": {
    "value": "#7c2d12",
    "variable": "var(--colors-orange-900)"
  },
  "colors.orange.950": {
    "value": "#431407",
    "variable": "var(--colors-orange-950)"
  },
  "colors.red.50": {
    "value": "#fef2f2",
    "variable": "var(--colors-red-50)"
  },
  "colors.red.100": {
    "value": "#fee2e2",
    "variable": "var(--colors-red-100)"
  },
  "colors.red.200": {
    "value": "#fecaca",
    "variable": "var(--colors-red-200)"
  },
  "colors.red.300": {
    "value": "#fca5a5",
    "variable": "var(--colors-red-300)"
  },
  "colors.red.400": {
    "value": "#f87171",
    "variable": "var(--colors-red-400)"
  },
  "colors.red.500": {
    "value": "#ef4444",
    "variable": "var(--colors-red-500)"
  },
  "colors.red.600": {
    "value": "#dc2626",
    "variable": "var(--colors-red-600)"
  },
  "colors.red.700": {
    "value": "#b91c1c",
    "variable": "var(--colors-red-700)"
  },
  "colors.red.800": {
    "value": "#991b1b",
    "variable": "var(--colors-red-800)"
  },
  "colors.red.900": {
    "value": "#7f1d1d",
    "variable": "var(--colors-red-900)"
  },
  "colors.red.950": {
    "value": "#450a0a",
    "variable": "var(--colors-red-950)"
  },
  "colors.neutral.50": {
    "value": "#fafafa",
    "variable": "var(--colors-neutral-50)"
  },
  "colors.neutral.100": {
    "value": "#f5f5f5",
    "variable": "var(--colors-neutral-100)"
  },
  "colors.neutral.200": {
    "value": "#e5e5e5",
    "variable": "var(--colors-neutral-200)"
  },
  "colors.neutral.300": {
    "value": "#d4d4d4",
    "variable": "var(--colors-neutral-300)"
  },
  "colors.neutral.400": {
    "value": "#a3a3a3",
    "variable": "var(--colors-neutral-400)"
  },
  "colors.neutral.500": {
    "value": "#737373",
    "variable": "var(--colors-neutral-500)"
  },
  "colors.neutral.600": {
    "value": "#525252",
    "variable": "var(--colors-neutral-600)"
  },
  "colors.neutral.700": {
    "value": "#404040",
    "variable": "var(--colors-neutral-700)"
  },
  "colors.neutral.800": {
    "value": "#262626",
    "variable": "var(--colors-neutral-800)"
  },
  "colors.neutral.900": {
    "value": "#171717",
    "variable": "var(--colors-neutral-900)"
  },
  "colors.neutral.950": {
    "value": "#0a0a0a",
    "variable": "var(--colors-neutral-950)"
  },
  "colors.stone.50": {
    "value": "#fafaf9",
    "variable": "var(--colors-stone-50)"
  },
  "colors.stone.100": {
    "value": "#f5f5f4",
    "variable": "var(--colors-stone-100)"
  },
  "colors.stone.200": {
    "value": "#e7e5e4",
    "variable": "var(--colors-stone-200)"
  },
  "colors.stone.300": {
    "value": "#d6d3d1",
    "variable": "var(--colors-stone-300)"
  },
  "colors.stone.400": {
    "value": "#a8a29e",
    "variable": "var(--colors-stone-400)"
  },
  "colors.stone.500": {
    "value": "#78716c",
    "variable": "var(--colors-stone-500)"
  },
  "colors.stone.600": {
    "value": "#57534e",
    "variable": "var(--colors-stone-600)"
  },
  "colors.stone.700": {
    "value": "#44403c",
    "variable": "var(--colors-stone-700)"
  },
  "colors.stone.800": {
    "value": "#292524",
    "variable": "var(--colors-stone-800)"
  },
  "colors.stone.900": {
    "value": "#1c1917",
    "variable": "var(--colors-stone-900)"
  },
  "colors.stone.950": {
    "value": "#0c0a09",
    "variable": "var(--colors-stone-950)"
  },
  "colors.zinc.50": {
    "value": "#fafafa",
    "variable": "var(--colors-zinc-50)"
  },
  "colors.zinc.100": {
    "value": "#f4f4f5",
    "variable": "var(--colors-zinc-100)"
  },
  "colors.zinc.200": {
    "value": "#e4e4e7",
    "variable": "var(--colors-zinc-200)"
  },
  "colors.zinc.300": {
    "value": "#d4d4d8",
    "variable": "var(--colors-zinc-300)"
  },
  "colors.zinc.400": {
    "value": "#a1a1aa",
    "variable": "var(--colors-zinc-400)"
  },
  "colors.zinc.500": {
    "value": "#71717a",
    "variable": "var(--colors-zinc-500)"
  },
  "colors.zinc.600": {
    "value": "#52525b",
    "variable": "var(--colors-zinc-600)"
  },
  "colors.zinc.700": {
    "value": "#3f3f46",
    "variable": "var(--colors-zinc-700)"
  },
  "colors.zinc.800": {
    "value": "#27272a",
    "variable": "var(--colors-zinc-800)"
  },
  "colors.zinc.900": {
    "value": "#18181b",
    "variable": "var(--colors-zinc-900)"
  },
  "colors.zinc.950": {
    "value": "#09090b",
    "variable": "var(--colors-zinc-950)"
  },
  "colors.gray.50": {
    "value": "#f9fafb",
    "variable": "var(--colors-gray-50)"
  },
  "colors.gray.100": {
    "value": "#f3f4f6",
    "variable": "var(--colors-gray-100)"
  },
  "colors.gray.200": {
    "value": "#e5e7eb",
    "variable": "var(--colors-gray-200)"
  },
  "colors.gray.300": {
    "value": "#d1d5db",
    "variable": "var(--colors-gray-300)"
  },
  "colors.gray.400": {
    "value": "#9ca3af",
    "variable": "var(--colors-gray-400)"
  },
  "colors.gray.500": {
    "value": "#6b7280",
    "variable": "var(--colors-gray-500)"
  },
  "colors.gray.600": {
    "value": "#4b5563",
    "variable": "var(--colors-gray-600)"
  },
  "colors.gray.700": {
    "value": "#374151",
    "variable": "var(--colors-gray-700)"
  },
  "colors.gray.800": {
    "value": "#1f2937",
    "variable": "var(--colors-gray-800)"
  },
  "colors.gray.900": {
    "value": "#111827",
    "variable": "var(--colors-gray-900)"
  },
  "colors.gray.950": {
    "value": "#030712",
    "variable": "var(--colors-gray-950)"
  },
  "colors.slate.50": {
    "value": "#f8fafc",
    "variable": "var(--colors-slate-50)"
  },
  "colors.slate.100": {
    "value": "#f1f5f9",
    "variable": "var(--colors-slate-100)"
  },
  "colors.slate.200": {
    "value": "#e2e8f0",
    "variable": "var(--colors-slate-200)"
  },
  "colors.slate.300": {
    "value": "#cbd5e1",
    "variable": "var(--colors-slate-300)"
  },
  "colors.slate.400": {
    "value": "#94a3b8",
    "variable": "var(--colors-slate-400)"
  },
  "colors.slate.500": {
    "value": "#64748b",
    "variable": "var(--colors-slate-500)"
  },
  "colors.slate.600": {
    "value": "#475569",
    "variable": "var(--colors-slate-600)"
  },
  "colors.slate.700": {
    "value": "#334155",
    "variable": "var(--colors-slate-700)"
  },
  "colors.slate.800": {
    "value": "#1e293b",
    "variable": "var(--colors-slate-800)"
  },
  "colors.slate.900": {
    "value": "#0f172a",
    "variable": "var(--colors-slate-900)"
  },
  "colors.slate.950": {
    "value": "#020617",
    "variable": "var(--colors-slate-950)"
  },
  "colors.brand.blue": {
    "value": "#00B2CC",
    "variable": "var(--colors-brand\\.blue)"
  },
  "colors.brand.red": {
    "value": "#ED3F30",
    "variable": "var(--colors-brand\\.red)"
  },
  "colors.brand.dark": {
    "value": "#333232",
    "variable": "var(--colors-brand\\.dark)"
  },
  "colors.neutral.dark": {
    "value": "#333232",
    "variable": "var(--colors-neutral\\.dark)"
  },
  "colors.neutral.medium": {
    "value": "#5C6464",
    "variable": "var(--colors-neutral\\.medium)"
  },
  "colors.neutral.base": {
    "value": "#8E9191",
    "variable": "var(--colors-neutral\\.base)"
  },
  "colors.neutral.blue": {
    "value": "#A3B0B3",
    "variable": "var(--colors-neutral\\.blue)"
  },
  "colors.neutral.light": {
    "value": "#EAEAEA",
    "variable": "var(--colors-neutral\\.light)"
  },
  "colors.data.navy": {
    "value": "#003A5D",
    "variable": "var(--colors-data\\.navy)"
  },
  "colors.data.red": {
    "value": "#ED3F30",
    "variable": "var(--colors-data\\.red)"
  },
  "colors.data.blue": {
    "value": "#00B2CC",
    "variable": "var(--colors-data\\.blue)"
  },
  "colors.data.orange": {
    "value": "#EF8936",
    "variable": "var(--colors-data\\.orange)"
  },
  "colors.data.purple-dark": {
    "value": "#764FA0",
    "variable": "var(--colors-data\\.purple-dark)"
  },
  "colors.data.yellow": {
    "value": "#E7E51A",
    "variable": "var(--colors-data\\.yellow)"
  },
  "colors.data.purple": {
    "value": "#B65DA4",
    "variable": "var(--colors-data\\.purple)"
  },
  "colors.data.green": {
    "value": "#8AC640",
    "variable": "var(--colors-data\\.green)"
  },
  "colors.bg.base": {
    "value": "#FFFFFF",
    "variable": "var(--colors-bg\\.base)"
  },
  "colors.bg.subtle": {
    "value": "#F7F7F7",
    "variable": "var(--colors-bg\\.subtle)"
  },
  "colors.bg.elevated": {
    "value": "#FFFFFF",
    "variable": "var(--colors-bg\\.elevated)"
  },
  "colors.border.subtle": {
    "value": "#EAEAEA",
    "variable": "var(--colors-border\\.subtle)"
  },
  "colors.border.strong": {
    "value": "#8E9191",
    "variable": "var(--colors-border\\.strong)"
  },
  "colors.state.info": {
    "value": "#00B2CC",
    "variable": "var(--colors-state\\.info)"
  },
  "colors.state.success": {
    "value": "#8AC640",
    "variable": "var(--colors-state\\.success)"
  },
  "colors.state.warning": {
    "value": "#EF8936",
    "variable": "var(--colors-state\\.warning)"
  },
  "colors.state.danger": {
    "value": "#ED3F30",
    "variable": "var(--colors-state\\.danger)"
  },
  "colors.text.main": {
    "value": "#333232",
    "variable": "var(--colors-text\\.main)"
  },
  "colors.text.subtle": {
    "value": "#5C6464",
    "variable": "var(--colors-text\\.subtle)"
  },
  "colors.text.on-dark": {
    "value": "#FFFFFF",
    "variable": "var(--colors-text\\.on-dark)"
  },
  "colors.text.link": {
    "value": "#00B2CC",
    "variable": "var(--colors-text\\.link)"
  },
  "colors.text.link-hover": {
    "value": "#003A5D",
    "variable": "var(--colors-text\\.link-hover)"
  },
  "spacing.0": {
    "value": "0rem",
    "variable": "var(--spacing-0)"
  },
  "spacing.1": {
    "value": "0.25rem",
    "variable": "var(--spacing-1)"
  },
  "spacing.2": {
    "value": "0.5rem",
    "variable": "var(--spacing-2)"
  },
  "spacing.3": {
    "value": "0.75rem",
    "variable": "var(--spacing-3)"
  },
  "spacing.4": {
    "value": "1rem",
    "variable": "var(--spacing-4)"
  },
  "spacing.5": {
    "value": "1.25rem",
    "variable": "var(--spacing-5)"
  },
  "spacing.6": {
    "value": "1.5rem",
    "variable": "var(--spacing-6)"
  },
  "spacing.7": {
    "value": "1.75rem",
    "variable": "var(--spacing-7)"
  },
  "spacing.8": {
    "value": "2rem",
    "variable": "var(--spacing-8)"
  },
  "spacing.9": {
    "value": "2.25rem",
    "variable": "var(--spacing-9)"
  },
  "spacing.10": {
    "value": "2.5rem",
    "variable": "var(--spacing-10)"
  },
  "spacing.11": {
    "value": "2.75rem",
    "variable": "var(--spacing-11)"
  },
  "spacing.12": {
    "value": "3rem",
    "variable": "var(--spacing-12)"
  },
  "spacing.14": {
    "value": "3.5rem",
    "variable": "var(--spacing-14)"
  },
  "spacing.16": {
    "value": "4rem",
    "variable": "var(--spacing-16)"
  },
  "spacing.20": {
    "value": "5rem",
    "variable": "var(--spacing-20)"
  },
  "spacing.24": {
    "value": "6rem",
    "variable": "var(--spacing-24)"
  },
  "spacing.28": {
    "value": "7rem",
    "variable": "var(--spacing-28)"
  },
  "spacing.32": {
    "value": "8rem",
    "variable": "var(--spacing-32)"
  },
  "spacing.36": {
    "value": "9rem",
    "variable": "var(--spacing-36)"
  },
  "spacing.40": {
    "value": "10rem",
    "variable": "var(--spacing-40)"
  },
  "spacing.44": {
    "value": "11rem",
    "variable": "var(--spacing-44)"
  },
  "spacing.48": {
    "value": "12rem",
    "variable": "var(--spacing-48)"
  },
  "spacing.52": {
    "value": "13rem",
    "variable": "var(--spacing-52)"
  },
  "spacing.56": {
    "value": "14rem",
    "variable": "var(--spacing-56)"
  },
  "spacing.60": {
    "value": "15rem",
    "variable": "var(--spacing-60)"
  },
  "spacing.64": {
    "value": "16rem",
    "variable": "var(--spacing-64)"
  },
  "spacing.72": {
    "value": "18rem",
    "variable": "var(--spacing-72)"
  },
  "spacing.80": {
    "value": "20rem",
    "variable": "var(--spacing-80)"
  },
  "spacing.96": {
    "value": "24rem",
    "variable": "var(--spacing-96)"
  },
  "spacing.0.5": {
    "value": "0.125rem",
    "variable": "var(--spacing-0\\.5)"
  },
  "spacing.1.5": {
    "value": "0.375rem",
    "variable": "var(--spacing-1\\.5)"
  },
  "spacing.2.5": {
    "value": "0.625rem",
    "variable": "var(--spacing-2\\.5)"
  },
  "spacing.3.5": {
    "value": "0.875rem",
    "variable": "var(--spacing-3\\.5)"
  },
  "spacing.4.5": {
    "value": "1.125rem",
    "variable": "var(--spacing-4\\.5)"
  },
  "spacing.5.5": {
    "value": "1.375rem",
    "variable": "var(--spacing-5\\.5)"
  },
  "spacing.2xs": {
    "value": "4px",
    "variable": "var(--spacing-2xs)"
  },
  "spacing.xs": {
    "value": "8px",
    "variable": "var(--spacing-xs)"
  },
  "spacing.sm": {
    "value": "12px",
    "variable": "var(--spacing-sm)"
  },
  "spacing.md": {
    "value": "16px",
    "variable": "var(--spacing-md)"
  },
  "spacing.lg": {
    "value": "24px",
    "variable": "var(--spacing-lg)"
  },
  "spacing.xl": {
    "value": "32px",
    "variable": "var(--spacing-xl)"
  },
  "spacing.2xl": {
    "value": "48px",
    "variable": "var(--spacing-2xl)"
  },
  "fontSizes.2xs": {
    "value": "0.5rem",
    "variable": "var(--font-sizes-2xs)"
  },
  "fontSizes.4xl": {
    "value": "2.25rem",
    "variable": "var(--font-sizes-4xl)"
  },
  "fontSizes.5xl": {
    "value": "3rem",
    "variable": "var(--font-sizes-5xl)"
  },
  "fontSizes.6xl": {
    "value": "3.75rem",
    "variable": "var(--font-sizes-6xl)"
  },
  "fontSizes.7xl": {
    "value": "4.5rem",
    "variable": "var(--font-sizes-7xl)"
  },
  "fontSizes.8xl": {
    "value": "6rem",
    "variable": "var(--font-sizes-8xl)"
  },
  "fontSizes.9xl": {
    "value": "8rem",
    "variable": "var(--font-sizes-9xl)"
  },
  "fontSizes.xs": {
    "value": "12px",
    "variable": "var(--font-sizes-xs)"
  },
  "fontSizes.sm": {
    "value": "14px",
    "variable": "var(--font-sizes-sm)"
  },
  "fontSizes.md": {
    "value": "16px",
    "variable": "var(--font-sizes-md)"
  },
  "fontSizes.lg": {
    "value": "20px",
    "variable": "var(--font-sizes-lg)"
  },
  "fontSizes.xl": {
    "value": "24px",
    "variable": "var(--font-sizes-xl)"
  },
  "fontSizes.2xl": {
    "value": "32px",
    "variable": "var(--font-sizes-2xl)"
  },
  "fontSizes.3xl": {
    "value": "40px",
    "variable": "var(--font-sizes-3xl)"
  },
  "lineHeights.none": {
    "value": "1",
    "variable": "var(--line-heights-none)"
  },
  "lineHeights.snug": {
    "value": "1.375",
    "variable": "var(--line-heights-snug)"
  },
  "lineHeights.loose": {
    "value": "2",
    "variable": "var(--line-heights-loose)"
  },
  "lineHeights.tight": {
    "value": "1.2",
    "variable": "var(--line-heights-tight)"
  },
  "lineHeights.normal": {
    "value": "1.5",
    "variable": "var(--line-heights-normal)"
  },
  "lineHeights.relaxed": {
    "value": "1.7",
    "variable": "var(--line-heights-relaxed)"
  },
  "fontWeights.thin": {
    "value": "100",
    "variable": "var(--font-weights-thin)"
  },
  "fontWeights.extralight": {
    "value": "200",
    "variable": "var(--font-weights-extralight)"
  },
  "fontWeights.light": {
    "value": "300",
    "variable": "var(--font-weights-light)"
  },
  "fontWeights.normal": {
    "value": "400",
    "variable": "var(--font-weights-normal)"
  },
  "fontWeights.semibold": {
    "value": "600",
    "variable": "var(--font-weights-semibold)"
  },
  "fontWeights.extrabold": {
    "value": "800",
    "variable": "var(--font-weights-extrabold)"
  },
  "fontWeights.black": {
    "value": "900",
    "variable": "var(--font-weights-black)"
  },
  "fontWeights.regular": {
    "value": "400",
    "variable": "var(--font-weights-regular)"
  },
  "fontWeights.medium": {
    "value": "500",
    "variable": "var(--font-weights-medium)"
  },
  "fontWeights.bold": {
    "value": "700",
    "variable": "var(--font-weights-bold)"
  },
  "radii.xs": {
    "value": "0.125rem",
    "variable": "var(--radii-xs)"
  },
  "radii.xl": {
    "value": "0.75rem",
    "variable": "var(--radii-xl)"
  },
  "radii.2xl": {
    "value": "1rem",
    "variable": "var(--radii-2xl)"
  },
  "radii.3xl": {
    "value": "1.5rem",
    "variable": "var(--radii-3xl)"
  },
  "radii.4xl": {
    "value": "2rem",
    "variable": "var(--radii-4xl)"
  },
  "radii.full": {
    "value": "9999px",
    "variable": "var(--radii-full)"
  },
  "radii.sm": {
    "value": "4px",
    "variable": "var(--radii-sm)"
  },
  "radii.md": {
    "value": "8px",
    "variable": "var(--radii-md)"
  },
  "radii.lg": {
    "value": "12px",
    "variable": "var(--radii-lg)"
  },
  "radii.pill": {
    "value": "9999px",
    "variable": "var(--radii-pill)"
  },
  "shadows.2xs": {
    "value": "0 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-2xs)"
  },
  "shadows.xs": {
    "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-xs)"
  },
  "shadows.sm": {
    "value": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "variable": "var(--shadows-sm)"
  },
  "shadows.md": {
    "value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "variable": "var(--shadows-md)"
  },
  "shadows.lg": {
    "value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "variable": "var(--shadows-lg)"
  },
  "shadows.xl": {
    "value": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "variable": "var(--shadows-xl)"
  },
  "shadows.2xl": {
    "value": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "variable": "var(--shadows-2xl)"
  },
  "shadows.inset-2xs": {
    "value": "inset 0 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-inset-2xs)"
  },
  "shadows.inset-xs": {
    "value": "inset 0 1px 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-inset-xs)"
  },
  "shadows.inset-sm": {
    "value": "inset 0 2px 4px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-inset-sm)"
  },
  "shadows.soft": {
    "value": "0 2px 6px rgba(0, 0, 0, 0.08)",
    "variable": "var(--shadows-soft)"
  },
  "shadows.strong": {
    "value": "0 6px 24px rgba(0, 0, 0, 0.12)",
    "variable": "var(--shadows-strong)"
  },
  "durations.fastest": {
    "value": "50ms",
    "variable": "var(--durations-fastest)"
  },
  "durations.faster": {
    "value": "100ms",
    "variable": "var(--durations-faster)"
  },
  "durations.slower": {
    "value": "400ms",
    "variable": "var(--durations-slower)"
  },
  "durations.slowest": {
    "value": "500ms",
    "variable": "var(--durations-slowest)"
  },
  "durations.fast": {
    "value": "80ms",
    "variable": "var(--durations-fast)"
  },
  "durations.normal": {
    "value": "120ms",
    "variable": "var(--durations-normal)"
  },
  "durations.slow": {
    "value": "200ms",
    "variable": "var(--durations-slow)"
  },
  "durations.spinner": {
    "value": "700ms",
    "variable": "var(--durations-spinner)"
  },
  "zIndex.base": {
    "value": 0,
    "variable": "var(--z-index-base)"
  },
  "zIndex.dropdown": {
    "value": 1e3,
    "variable": "var(--z-index-dropdown)"
  },
  "zIndex.sticky": {
    "value": 1100,
    "variable": "var(--z-index-sticky)"
  },
  "zIndex.modal": {
    "value": 1200,
    "variable": "var(--z-index-modal)"
  },
  "zIndex.tooltip": {
    "value": 1300,
    "variable": "var(--z-index-tooltip)"
  },
  "zIndex.toast": {
    "value": 1400,
    "variable": "var(--z-index-toast)"
  },
  "sizes.0": {
    "value": "0rem",
    "variable": "var(--sizes-0)"
  },
  "sizes.1": {
    "value": "0.25rem",
    "variable": "var(--sizes-1)"
  },
  "sizes.2": {
    "value": "0.5rem",
    "variable": "var(--sizes-2)"
  },
  "sizes.3": {
    "value": "0.75rem",
    "variable": "var(--sizes-3)"
  },
  "sizes.4": {
    "value": "1rem",
    "variable": "var(--sizes-4)"
  },
  "sizes.5": {
    "value": "1.25rem",
    "variable": "var(--sizes-5)"
  },
  "sizes.6": {
    "value": "1.5rem",
    "variable": "var(--sizes-6)"
  },
  "sizes.7": {
    "value": "1.75rem",
    "variable": "var(--sizes-7)"
  },
  "sizes.8": {
    "value": "2rem",
    "variable": "var(--sizes-8)"
  },
  "sizes.9": {
    "value": "2.25rem",
    "variable": "var(--sizes-9)"
  },
  "sizes.10": {
    "value": "2.5rem",
    "variable": "var(--sizes-10)"
  },
  "sizes.11": {
    "value": "2.75rem",
    "variable": "var(--sizes-11)"
  },
  "sizes.12": {
    "value": "3rem",
    "variable": "var(--sizes-12)"
  },
  "sizes.14": {
    "value": "3.5rem",
    "variable": "var(--sizes-14)"
  },
  "sizes.16": {
    "value": "4rem",
    "variable": "var(--sizes-16)"
  },
  "sizes.20": {
    "value": "5rem",
    "variable": "var(--sizes-20)"
  },
  "sizes.24": {
    "value": "6rem",
    "variable": "var(--sizes-24)"
  },
  "sizes.28": {
    "value": "7rem",
    "variable": "var(--sizes-28)"
  },
  "sizes.32": {
    "value": "8rem",
    "variable": "var(--sizes-32)"
  },
  "sizes.36": {
    "value": "9rem",
    "variable": "var(--sizes-36)"
  },
  "sizes.40": {
    "value": "10rem",
    "variable": "var(--sizes-40)"
  },
  "sizes.44": {
    "value": "11rem",
    "variable": "var(--sizes-44)"
  },
  "sizes.48": {
    "value": "12rem",
    "variable": "var(--sizes-48)"
  },
  "sizes.52": {
    "value": "13rem",
    "variable": "var(--sizes-52)"
  },
  "sizes.56": {
    "value": "14rem",
    "variable": "var(--sizes-56)"
  },
  "sizes.60": {
    "value": "15rem",
    "variable": "var(--sizes-60)"
  },
  "sizes.64": {
    "value": "16rem",
    "variable": "var(--sizes-64)"
  },
  "sizes.72": {
    "value": "18rem",
    "variable": "var(--sizes-72)"
  },
  "sizes.80": {
    "value": "20rem",
    "variable": "var(--sizes-80)"
  },
  "sizes.96": {
    "value": "24rem",
    "variable": "var(--sizes-96)"
  },
  "sizes.0.5": {
    "value": "0.125rem",
    "variable": "var(--sizes-0\\.5)"
  },
  "sizes.1.5": {
    "value": "0.375rem",
    "variable": "var(--sizes-1\\.5)"
  },
  "sizes.2.5": {
    "value": "0.625rem",
    "variable": "var(--sizes-2\\.5)"
  },
  "sizes.3.5": {
    "value": "0.875rem",
    "variable": "var(--sizes-3\\.5)"
  },
  "sizes.4.5": {
    "value": "1.125rem",
    "variable": "var(--sizes-4\\.5)"
  },
  "sizes.5.5": {
    "value": "1.375rem",
    "variable": "var(--sizes-5\\.5)"
  },
  "sizes.xs": {
    "value": "20rem",
    "variable": "var(--sizes-xs)"
  },
  "sizes.sm": {
    "value": "24rem",
    "variable": "var(--sizes-sm)"
  },
  "sizes.md": {
    "value": "28rem",
    "variable": "var(--sizes-md)"
  },
  "sizes.lg": {
    "value": "32rem",
    "variable": "var(--sizes-lg)"
  },
  "sizes.xl": {
    "value": "36rem",
    "variable": "var(--sizes-xl)"
  },
  "sizes.2xl": {
    "value": "42rem",
    "variable": "var(--sizes-2xl)"
  },
  "sizes.3xl": {
    "value": "48rem",
    "variable": "var(--sizes-3xl)"
  },
  "sizes.4xl": {
    "value": "56rem",
    "variable": "var(--sizes-4xl)"
  },
  "sizes.5xl": {
    "value": "64rem",
    "variable": "var(--sizes-5xl)"
  },
  "sizes.6xl": {
    "value": "72rem",
    "variable": "var(--sizes-6xl)"
  },
  "sizes.7xl": {
    "value": "80rem",
    "variable": "var(--sizes-7xl)"
  },
  "sizes.8xl": {
    "value": "90rem",
    "variable": "var(--sizes-8xl)"
  },
  "sizes.prose": {
    "value": "65ch",
    "variable": "var(--sizes-prose)"
  },
  "sizes.full": {
    "value": "100%",
    "variable": "var(--sizes-full)"
  },
  "sizes.min": {
    "value": "min-content",
    "variable": "var(--sizes-min)"
  },
  "sizes.max": {
    "value": "max-content",
    "variable": "var(--sizes-max)"
  },
  "sizes.fit": {
    "value": "fit-content",
    "variable": "var(--sizes-fit)"
  },
  "sizes.page.max-width": {
    "value": "1120px",
    "variable": "var(--sizes-page\\.max-width)"
  },
  "sizes.page.gutter-x": {
    "value": "24px",
    "variable": "var(--sizes-page\\.gutter-x)"
  },
  "sizes.page.gutter-y": {
    "value": "24px",
    "variable": "var(--sizes-page\\.gutter-y)"
  },
  "sizes.button.min-height": {
    "value": "40px",
    "variable": "var(--sizes-button\\.min-height)"
  },
  "sizes.input.min-height": {
    "value": "40px",
    "variable": "var(--sizes-input\\.min-height)"
  },
  "sizes.textarea.min-height": {
    "value": "120px",
    "variable": "var(--sizes-textarea\\.min-height)"
  },
  "sizes.spinner.sm": {
    "value": "16px",
    "variable": "var(--sizes-spinner\\.sm)"
  },
  "sizes.spinner.md": {
    "value": "24px",
    "variable": "var(--sizes-spinner\\.md)"
  },
  "sizes.spinner.lg": {
    "value": "32px",
    "variable": "var(--sizes-spinner\\.lg)"
  },
  "sizes.breakpoint-2xl": {
    "value": "1536px",
    "variable": "var(--sizes-breakpoint-2xl)"
  },
  "sizes.breakpoint-sm": {
    "value": "480px",
    "variable": "var(--sizes-breakpoint-sm)"
  },
  "sizes.breakpoint-md": {
    "value": "768px",
    "variable": "var(--sizes-breakpoint-md)"
  },
  "sizes.breakpoint-lg": {
    "value": "1024px",
    "variable": "var(--sizes-breakpoint-lg)"
  },
  "sizes.breakpoint-xl": {
    "value": "1280px",
    "variable": "var(--sizes-breakpoint-xl)"
  },
  "breakpoints.2xl": {
    "value": "1536px",
    "variable": "var(--breakpoints-2xl)"
  },
  "breakpoints.sm": {
    "value": "480px",
    "variable": "var(--breakpoints-sm)"
  },
  "breakpoints.md": {
    "value": "768px",
    "variable": "var(--breakpoints-md)"
  },
  "breakpoints.lg": {
    "value": "1024px",
    "variable": "var(--breakpoints-lg)"
  },
  "breakpoints.xl": {
    "value": "1280px",
    "variable": "var(--breakpoints-xl)"
  },
  "colors.accent.primary": {
    "value": "var(--colors-brand\\.blue)",
    "variable": "var(--colors-accent\\.primary)"
  },
  "colors.accent.secondary": {
    "value": "var(--colors-brand\\.red)",
    "variable": "var(--colors-accent\\.secondary)"
  },
  "colors.accent.dark": {
    "value": "var(--colors-brand\\.dark)",
    "variable": "var(--colors-accent\\.dark)"
  },
  "colors.text.primary": {
    "value": "var(--colors-text\\.main)",
    "variable": "var(--colors-text\\.primary)"
  },
  "colors.text.secondary": {
    "value": "var(--colors-text\\.subtle)",
    "variable": "var(--colors-text\\.secondary)"
  },
  "colors.text.linkHover": {
    "value": "var(--colors-text\\.link-hover)",
    "variable": "var(--colors-text\\.link-hover)"
  },
  "colors.background.base": {
    "value": "var(--colors-bg\\.base)",
    "variable": "var(--colors-background\\.base)"
  },
  "colors.background.subtle": {
    "value": "var(--colors-bg\\.subtle)",
    "variable": "var(--colors-background\\.subtle)"
  },
  "colors.background.elevated": {
    "value": "var(--colors-bg\\.elevated)",
    "variable": "var(--colors-background\\.elevated)"
  },
  "colors.button.primary.bg": {
    "value": "var(--colors-brand\\.blue)",
    "variable": "var(--colors-button\\.primary\\.bg)"
  },
  "colors.button.primary.bgHover": {
    "value": "var(--colors-data\\.navy)",
    "variable": "var(--colors-button\\.primary\\.bg-hover)"
  },
  "colors.button.primary.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-button\\.primary\\.text)"
  },
  "colors.button.secondary.bg": {
    "value": "var(--colors-bg\\.elevated)",
    "variable": "var(--colors-button\\.secondary\\.bg)"
  },
  "colors.button.secondary.bgHover": {
    "value": "var(--colors-bg\\.subtle)",
    "variable": "var(--colors-button\\.secondary\\.bg-hover)"
  },
  "colors.button.secondary.border": {
    "value": "var(--colors-border\\.strong)",
    "variable": "var(--colors-button\\.secondary\\.border)"
  },
  "colors.button.secondary.text": {
    "value": "var(--colors-text\\.main)",
    "variable": "var(--colors-button\\.secondary\\.text)"
  },
  "colors.button.danger.bg": {
    "value": "var(--colors-state\\.danger)",
    "variable": "var(--colors-button\\.danger\\.bg)"
  },
  "colors.button.danger.bgHover": {
    "value": "#c7382f",
    "variable": "var(--colors-button\\.danger\\.bg-hover)"
  },
  "colors.button.danger.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-button\\.danger\\.text)"
  },
  "colors.alert.info.bg": {
    "value": "rgba(0, 178, 204, 0.1)",
    "variable": "var(--colors-alert\\.info\\.bg)"
  },
  "colors.alert.info.border": {
    "value": "var(--colors-state\\.info)",
    "variable": "var(--colors-alert\\.info\\.border)"
  },
  "colors.alert.info.text": {
    "value": "var(--colors-data\\.navy)",
    "variable": "var(--colors-alert\\.info\\.text)"
  },
  "colors.alert.success.bg": {
    "value": "rgba(138, 198, 64, 0.1)",
    "variable": "var(--colors-alert\\.success\\.bg)"
  },
  "colors.alert.success.border": {
    "value": "var(--colors-state\\.success)",
    "variable": "var(--colors-alert\\.success\\.border)"
  },
  "colors.alert.success.text": {
    "value": "#3d6b1a",
    "variable": "var(--colors-alert\\.success\\.text)"
  },
  "colors.alert.warning.bg": {
    "value": "rgba(239, 137, 54, 0.1)",
    "variable": "var(--colors-alert\\.warning\\.bg)"
  },
  "colors.alert.warning.border": {
    "value": "var(--colors-state\\.warning)",
    "variable": "var(--colors-alert\\.warning\\.border)"
  },
  "colors.alert.warning.text": {
    "value": "#8b4513",
    "variable": "var(--colors-alert\\.warning\\.text)"
  },
  "colors.alert.danger.bg": {
    "value": "rgba(237, 63, 48, 0.1)",
    "variable": "var(--colors-alert\\.danger\\.bg)"
  },
  "colors.alert.danger.border": {
    "value": "var(--colors-state\\.danger)",
    "variable": "var(--colors-alert\\.danger\\.border)"
  },
  "colors.alert.danger.text": {
    "value": "#a81a0f",
    "variable": "var(--colors-alert\\.danger\\.text)"
  },
  "colors.toast.bg": {
    "value": "var(--colors-brand\\.dark)",
    "variable": "var(--colors-toast\\.bg)"
  },
  "colors.toast.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-toast\\.text)"
  },
  "colors.toast.border": {
    "value": "var(--colors-border\\.strong)",
    "variable": "var(--colors-toast\\.border)"
  },
  "colors.toast.closeHover": {
    "value": "rgba(255, 255, 255, 0.1)",
    "variable": "var(--colors-toast\\.close-hover)"
  },
  "colors.progress.bg": {
    "value": "var(--colors-neutral\\.light)",
    "variable": "var(--colors-progress\\.bg)"
  },
  "colors.progress.fill": {
    "value": "var(--colors-brand\\.blue)",
    "variable": "var(--colors-progress\\.fill)"
  },
  "colors.spinner.color": {
    "value": "var(--colors-brand\\.blue)",
    "variable": "var(--colors-spinner\\.color)"
  },
  "colors.tabs.active.border": {
    "value": "var(--colors-brand\\.blue)",
    "variable": "var(--colors-tabs\\.active\\.border)"
  },
  "colors.tabs.active.text": {
    "value": "var(--colors-brand\\.blue)",
    "variable": "var(--colors-tabs\\.active\\.text)"
  },
  "colors.tabs.inactive.text": {
    "value": "var(--colors-text\\.subtle)",
    "variable": "var(--colors-tabs\\.inactive\\.text)"
  },
  "colors.tabs.hover.bg": {
    "value": "var(--colors-bg\\.subtle)",
    "variable": "var(--colors-tabs\\.hover\\.bg)"
  },
  "colors.accordion.trigger.hover": {
    "value": "var(--colors-bg\\.subtle)",
    "variable": "var(--colors-accordion\\.trigger\\.hover)"
  },
  "colors.accordion.content.bg": {
    "value": "var(--colors-bg\\.base)",
    "variable": "var(--colors-accordion\\.content\\.bg)"
  },
  "colors.popover.bg": {
    "value": "var(--colors-bg\\.elevated)",
    "variable": "var(--colors-popover\\.bg)"
  },
  "colors.popover.border": {
    "value": "var(--colors-border\\.subtle)",
    "variable": "var(--colors-popover\\.border)"
  },
  "colors.tooltip.bg": {
    "value": "var(--colors-brand\\.dark)",
    "variable": "var(--colors-tooltip\\.bg)"
  },
  "colors.tooltip.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-tooltip\\.text)"
  },
  "colors.overlay.modal": {
    "value": "rgba(0, 0, 0, 0.5)",
    "variable": "var(--colors-overlay\\.modal)"
  },
  "colors.selection.bg": {
    "value": "rgba(0, 178, 204, 0.1)",
    "variable": "var(--colors-selection\\.bg)"
  },
  "radii.component.buttonRadius": {
    "value": "var(--radii-md)",
    "variable": "var(--radii-component\\.button-radius)"
  },
  "radii.component.inputRadius": {
    "value": "var(--radii-md)",
    "variable": "var(--radii-component\\.input-radius)"
  },
  "radii.component.cardRadius": {
    "value": "var(--radii-lg)",
    "variable": "var(--radii-component\\.card-radius)"
  },
  "radii.component.modalRadius": {
    "value": "var(--radii-lg)",
    "variable": "var(--radii-component\\.modal-radius)"
  },
  "radii.component.badgeRadius": {
    "value": "var(--radii-pill)",
    "variable": "var(--radii-component\\.badge-radius)"
  },
  "radii.component.alertRadius": {
    "value": "var(--radii-md)",
    "variable": "var(--radii-component\\.alert-radius)"
  },
  "radii.component.toastRadius": {
    "value": "var(--radii-md)",
    "variable": "var(--radii-component\\.toast-radius)"
  },
  "radii.component.popoverRadius": {
    "value": "var(--radii-md)",
    "variable": "var(--radii-component\\.popover-radius)"
  },
  "radii.component.progressRadius": {
    "value": "var(--radii-pill)",
    "variable": "var(--radii-component\\.progress-radius)"
  },
  "shadows.component.cardShadow": {
    "value": "var(--shadows-soft)",
    "variable": "var(--shadows-component\\.card-shadow)"
  },
  "shadows.component.modalShadow": {
    "value": "var(--shadows-strong)",
    "variable": "var(--shadows-component\\.modal-shadow)"
  },
  "shadows.component.dropdownShadow": {
    "value": "var(--shadows-strong)",
    "variable": "var(--shadows-component\\.dropdown-shadow)"
  },
  "shadows.component.popoverShadow": {
    "value": "var(--shadows-strong)",
    "variable": "var(--shadows-component\\.popover-shadow)"
  },
  "shadows.component.toastShadow": {
    "value": "var(--shadows-strong)",
    "variable": "var(--shadows-component\\.toast-shadow)"
  },
  "shadows.focus.primary": {
    "value": "0 0 0 3px rgba(0, 178, 204, 0.1)",
    "variable": "var(--shadows-focus\\.primary)"
  },
  "shadows.focus.dialog": {
    "value": "0 0 0 2px rgba(0, 178, 204, 0.3)",
    "variable": "var(--shadows-focus\\.dialog)"
  },
  "shadows.focus.danger": {
    "value": "0 0 0 3px rgba(220, 38, 38, 0.1)",
    "variable": "var(--shadows-focus\\.danger)"
  },
  "shadows.focus.button": {
    "value": "0 0 0 3px rgba(0, 178, 204, 0.3)",
    "variable": "var(--shadows-focus\\.button)"
  },
  "shadows.focus.light": {
    "value": "0 0 0 2px rgba(255, 255, 255, 0.3)",
    "variable": "var(--shadows-focus\\.light)"
  },
  "sizes.component.buttonMinHeight": {
    "value": "var(--sizes-button\\.min-height)",
    "variable": "var(--sizes-component\\.button-min-height)"
  },
  "sizes.component.inputMinHeight": {
    "value": "var(--sizes-input\\.min-height)",
    "variable": "var(--sizes-component\\.input-min-height)"
  },
  "sizes.component.textareaMinHeight": {
    "value": "var(--sizes-textarea\\.min-height)",
    "variable": "var(--sizes-component\\.textarea-min-height)"
  },
  "sizes.component.spinnerSm": {
    "value": "var(--sizes-spinner\\.sm)",
    "variable": "var(--sizes-component\\.spinner-sm)"
  },
  "sizes.component.spinnerMd": {
    "value": "var(--sizes-spinner\\.md)",
    "variable": "var(--sizes-component\\.spinner-md)"
  },
  "sizes.component.spinnerLg": {
    "value": "var(--sizes-spinner\\.lg)",
    "variable": "var(--sizes-component\\.spinner-lg)"
  },
  "spacing.-1": {
    "value": "calc(var(--spacing-1) * -1)",
    "variable": "var(--spacing-1)"
  },
  "spacing.-2": {
    "value": "calc(var(--spacing-2) * -1)",
    "variable": "var(--spacing-2)"
  },
  "spacing.-3": {
    "value": "calc(var(--spacing-3) * -1)",
    "variable": "var(--spacing-3)"
  },
  "spacing.-4": {
    "value": "calc(var(--spacing-4) * -1)",
    "variable": "var(--spacing-4)"
  },
  "spacing.-5": {
    "value": "calc(var(--spacing-5) * -1)",
    "variable": "var(--spacing-5)"
  },
  "spacing.-6": {
    "value": "calc(var(--spacing-6) * -1)",
    "variable": "var(--spacing-6)"
  },
  "spacing.-7": {
    "value": "calc(var(--spacing-7) * -1)",
    "variable": "var(--spacing-7)"
  },
  "spacing.-8": {
    "value": "calc(var(--spacing-8) * -1)",
    "variable": "var(--spacing-8)"
  },
  "spacing.-9": {
    "value": "calc(var(--spacing-9) * -1)",
    "variable": "var(--spacing-9)"
  },
  "spacing.-10": {
    "value": "calc(var(--spacing-10) * -1)",
    "variable": "var(--spacing-10)"
  },
  "spacing.-11": {
    "value": "calc(var(--spacing-11) * -1)",
    "variable": "var(--spacing-11)"
  },
  "spacing.-12": {
    "value": "calc(var(--spacing-12) * -1)",
    "variable": "var(--spacing-12)"
  },
  "spacing.-14": {
    "value": "calc(var(--spacing-14) * -1)",
    "variable": "var(--spacing-14)"
  },
  "spacing.-16": {
    "value": "calc(var(--spacing-16) * -1)",
    "variable": "var(--spacing-16)"
  },
  "spacing.-20": {
    "value": "calc(var(--spacing-20) * -1)",
    "variable": "var(--spacing-20)"
  },
  "spacing.-24": {
    "value": "calc(var(--spacing-24) * -1)",
    "variable": "var(--spacing-24)"
  },
  "spacing.-28": {
    "value": "calc(var(--spacing-28) * -1)",
    "variable": "var(--spacing-28)"
  },
  "spacing.-32": {
    "value": "calc(var(--spacing-32) * -1)",
    "variable": "var(--spacing-32)"
  },
  "spacing.-36": {
    "value": "calc(var(--spacing-36) * -1)",
    "variable": "var(--spacing-36)"
  },
  "spacing.-40": {
    "value": "calc(var(--spacing-40) * -1)",
    "variable": "var(--spacing-40)"
  },
  "spacing.-44": {
    "value": "calc(var(--spacing-44) * -1)",
    "variable": "var(--spacing-44)"
  },
  "spacing.-48": {
    "value": "calc(var(--spacing-48) * -1)",
    "variable": "var(--spacing-48)"
  },
  "spacing.-52": {
    "value": "calc(var(--spacing-52) * -1)",
    "variable": "var(--spacing-52)"
  },
  "spacing.-56": {
    "value": "calc(var(--spacing-56) * -1)",
    "variable": "var(--spacing-56)"
  },
  "spacing.-60": {
    "value": "calc(var(--spacing-60) * -1)",
    "variable": "var(--spacing-60)"
  },
  "spacing.-64": {
    "value": "calc(var(--spacing-64) * -1)",
    "variable": "var(--spacing-64)"
  },
  "spacing.-72": {
    "value": "calc(var(--spacing-72) * -1)",
    "variable": "var(--spacing-72)"
  },
  "spacing.-80": {
    "value": "calc(var(--spacing-80) * -1)",
    "variable": "var(--spacing-80)"
  },
  "spacing.-96": {
    "value": "calc(var(--spacing-96) * -1)",
    "variable": "var(--spacing-96)"
  },
  "spacing.-0.5": {
    "value": "calc(var(--spacing-0\\.5) * -1)",
    "variable": "var(--spacing-0\\.5)"
  },
  "spacing.-1.5": {
    "value": "calc(var(--spacing-1\\.5) * -1)",
    "variable": "var(--spacing-1\\.5)"
  },
  "spacing.-2.5": {
    "value": "calc(var(--spacing-2\\.5) * -1)",
    "variable": "var(--spacing-2\\.5)"
  },
  "spacing.-3.5": {
    "value": "calc(var(--spacing-3\\.5) * -1)",
    "variable": "var(--spacing-3\\.5)"
  },
  "spacing.-4.5": {
    "value": "calc(var(--spacing-4\\.5) * -1)",
    "variable": "var(--spacing-4\\.5)"
  },
  "spacing.-5.5": {
    "value": "calc(var(--spacing-5\\.5) * -1)",
    "variable": "var(--spacing-5\\.5)"
  },
  "spacing.-2xs": {
    "value": "calc(var(--spacing-2xs) * -1)",
    "variable": "var(--spacing-2xs)"
  },
  "spacing.-xs": {
    "value": "calc(var(--spacing-xs) * -1)",
    "variable": "var(--spacing-xs)"
  },
  "spacing.-sm": {
    "value": "calc(var(--spacing-sm) * -1)",
    "variable": "var(--spacing-sm)"
  },
  "spacing.-md": {
    "value": "calc(var(--spacing-md) * -1)",
    "variable": "var(--spacing-md)"
  },
  "spacing.-lg": {
    "value": "calc(var(--spacing-lg) * -1)",
    "variable": "var(--spacing-lg)"
  },
  "spacing.-xl": {
    "value": "calc(var(--spacing-xl) * -1)",
    "variable": "var(--spacing-xl)"
  },
  "spacing.-2xl": {
    "value": "calc(var(--spacing-2xl) * -1)",
    "variable": "var(--spacing-2xl)"
  },
  "colors.colorPalette": {
    "value": "var(--colors-color-palette)",
    "variable": "var(--colors-color-palette)"
  },
  "colors.colorPalette.50": {
    "value": "var(--colors-color-palette-50)",
    "variable": "var(--colors-color-palette-50)"
  },
  "colors.colorPalette.100": {
    "value": "var(--colors-color-palette-100)",
    "variable": "var(--colors-color-palette-100)"
  },
  "colors.colorPalette.200": {
    "value": "var(--colors-color-palette-200)",
    "variable": "var(--colors-color-palette-200)"
  },
  "colors.colorPalette.300": {
    "value": "var(--colors-color-palette-300)",
    "variable": "var(--colors-color-palette-300)"
  },
  "colors.colorPalette.400": {
    "value": "var(--colors-color-palette-400)",
    "variable": "var(--colors-color-palette-400)"
  },
  "colors.colorPalette.500": {
    "value": "var(--colors-color-palette-500)",
    "variable": "var(--colors-color-palette-500)"
  },
  "colors.colorPalette.600": {
    "value": "var(--colors-color-palette-600)",
    "variable": "var(--colors-color-palette-600)"
  },
  "colors.colorPalette.700": {
    "value": "var(--colors-color-palette-700)",
    "variable": "var(--colors-color-palette-700)"
  },
  "colors.colorPalette.800": {
    "value": "var(--colors-color-palette-800)",
    "variable": "var(--colors-color-palette-800)"
  },
  "colors.colorPalette.900": {
    "value": "var(--colors-color-palette-900)",
    "variable": "var(--colors-color-palette-900)"
  },
  "colors.colorPalette.950": {
    "value": "var(--colors-color-palette-950)",
    "variable": "var(--colors-color-palette-950)"
  }
};
function token(path, fallback) {
  return tokens[path]?.value || fallback;
}
function tokenVar(path, fallback) {
  return tokens[path]?.variable || fallback;
}
token.var = tokenVar;

// src/event-calendar/EventCalendar.tsx
import { jsx as jsx28 } from "react/jsx-runtime";
var CalendarContainer = styled("div", {
  base: {
    fontFamily: "brand",
    borderRadius: "component.cardRadius",
    border: "1px solid",
    borderColor: "border.subtle",
    overflow: "hidden",
    bg: "background.base",
    // Override FullCalendar CSS variables with brand tokens
    "--fc-button-bg-color": token("colors.button.primary.bg"),
    "--fc-button-border-color": token("colors.button.primary.bg"),
    "--fc-button-text-color": token("colors.button.primary.text"),
    "--fc-button-hover-bg-color": token("colors.button.primary.bgHover"),
    "--fc-button-hover-border-color": token("colors.button.primary.bgHover"),
    "--fc-button-active-bg-color": token("colors.button.primary.bgHover"),
    "--fc-button-active-border-color": token("colors.button.primary.bgHover"),
    "--fc-border-color": token("colors.border.subtle"),
    "--fc-today-bg-color": token("colors.selection.bg"),
    "--fc-event-bg-color": token("colors.accent.primary"),
    "--fc-event-border-color": token("colors.accent.primary"),
    "--fc-event-text-color": token("colors.button.primary.text"),
    "--fc-page-bg-color": token("colors.background.base"),
    "--fc-neutral-bg-color": token("colors.background.subtle"),
    // FullCalendar toolbar styling
    "& .fc-toolbar": {
      padding: "md",
      gap: "sm",
      flexWrap: "wrap"
    },
    "& .fc-toolbar-title": {
      fontSize: "lg",
      fontWeight: "medium",
      color: "text.primary"
    },
    "& .fc-button": {
      bg: "button.primary.bg",
      color: "button.primary.text",
      border: "none",
      borderRadius: "component.buttonRadius",
      padding: "xs md",
      fontSize: "sm",
      fontWeight: "medium",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        bg: "button.primary.bgHover"
      },
      "&:focus": {
        outline: "none",
        boxShadow: "focus.button"
      },
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed"
      }
    },
    "& .fc-button-primary:not(:disabled).fc-button-active": {
      bg: "button.primary.bgHover"
    },
    "& .fc-button-group": {
      gap: "2xs",
      "& .fc-button": {
        borderRadius: "component.buttonRadius"
      }
    },
    // Calendar grid styling
    "& .fc-scrollgrid": {
      borderColor: "border.subtle"
    },
    "& .fc-col-header": {
      bg: "background.subtle"
    },
    "& .fc-col-header-cell": {
      padding: "sm",
      fontWeight: "medium",
      fontSize: "sm",
      color: "text.secondary",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    "& .fc-daygrid-day": {
      transition: "all 0.15s ease"
    },
    "& .fc-daygrid-day-number": {
      padding: "xs",
      fontSize: "sm",
      color: "text.primary"
    },
    "& .fc-day-today": {
      bg: "selection.bg"
    },
    "& .fc-day-other .fc-daygrid-day-number": {
      color: "text.secondary",
      opacity: 0.5
    },
    // Event styling
    "& .fc-event": {
      borderRadius: "sm",
      border: "none",
      fontSize: "xs",
      padding: "2xs xs",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        opacity: 0.9
      }
    },
    "& .fc-daygrid-event-dot": {
      borderColor: "accent.primary"
    },
    // Week numbers
    "& .fc-daygrid-week-number": {
      fontSize: "xs",
      color: "text.secondary",
      padding: "xs"
    },
    // Borders
    "& th, & td": {
      borderColor: "border.subtle"
    },
    // Remove default FullCalendar borders that might conflict
    "& .fc-scrollgrid-section > td": {
      borderColor: "border.subtle"
    }
  }
});
function EventCalendarComponent({
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
  editable = false,
  initialDate,
  initialView = "dayGridMonth",
  weekStartsOn = 0,
  showWeekNumbers = false,
  height = "auto"
}, ref) {
  const handleEventClick = (info) => {
    if (onEventClick) {
      const event = {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start || /* @__PURE__ */ new Date(),
        end: info.event.end || void 0,
        allDay: info.event.allDay,
        color: info.event.backgroundColor || void 0,
        textColor: info.event.textColor || void 0,
        extendedProps: info.event.extendedProps
      };
      onEventClick(event);
    }
  };
  const handleDateClick = (info) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };
  const handleEventDrop = (info) => {
    if (onEventDrop) {
      const event = {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start || /* @__PURE__ */ new Date(),
        end: info.event.end || void 0,
        allDay: info.event.allDay,
        color: info.event.backgroundColor || void 0,
        textColor: info.event.textColor || void 0,
        extendedProps: info.event.extendedProps
      };
      onEventDrop(event, info.event.start || /* @__PURE__ */ new Date(), info.event.end);
    }
  };
  return /* @__PURE__ */ jsx28(CalendarContainer, { ref, children: /* @__PURE__ */ jsx28(
    FullCalendar,
    {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView,
      initialDate,
      events,
      editable,
      eventClick: handleEventClick,
      dateClick: handleDateClick,
      eventDrop: handleEventDrop,
      firstDay: weekStartsOn,
      weekNumbers: showWeekNumbers,
      height,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridWeek,dayGridDay"
      },
      eventColor: token("colors.accent.primary"),
      eventTextColor: token("colors.button.primary.text")
    }
  ) });
}
EventCalendarComponent.displayName = "EventCalendar";
var EventCalendar = forwardRef29(EventCalendarComponent);
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Badge,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  Checkbox,
  Dialog,
  DropdownMenu,
  EventCalendar,
  FormContainer,
  FormHelperText,
  FormItemContainer,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Pagination,
  PaginationButton,
  PaginationEllipsis,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  SidePanel,
  Spinner,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toast,
  ToastProvider,
  Tooltip
};
