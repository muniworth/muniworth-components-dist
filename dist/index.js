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
      dark: {
        bg: "button.dark.bg",
        color: "button.dark.text",
        _hover: {
          bg: "button.dark.bgHover"
        }
      },
      outlined: {
        bg: "transparent",
        color: "button.outlined.text",
        border: "1px solid",
        borderColor: "button.outlined.border",
        _hover: {
          bg: "button.outlined.bgHover"
        }
      },
      ghost: {
        bg: "background.base",
        color: "text.primary",
        _hover: {
          bg: "button.ghost.bgHover",
          color: "text.primary"
        }
      }
    },
    size: {
      sm: {
        px: "sm",
        py: "xs",
        fontSize: "sm",
        minHeight: "component.buttonSmMinHeight"
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
        minHeight: "component.buttonLgMinHeight"
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
import { forwardRef as forwardRef3 } from "react";

// src/shared/form-elements.tsx
import "react";
import { jsx as jsx2 } from "react/jsx-runtime";
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
    fontSize: "xs",
    fontWeight: "bold",
    color: "text.primary",
    cursor: "pointer"
  }
});
var FormHelperText = styled("span", {
  base: {
    fontFamily: "brand",
    fontSize: "xs",
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
function renderFormHelperText({ error, helperText, fieldId }) {
  if (error) {
    return /* @__PURE__ */ jsx2(FormHelperText, { id: `${fieldId}-error`, isError: true, role: "alert", children: error });
  }
  if (helperText) {
    return /* @__PURE__ */ jsx2(FormHelperText, { id: `${fieldId}-helper`, isError: false, children: helperText });
  }
  return null;
}

// src/shared/use-form-field.ts
import { useId } from "react";
function useFormField({ id, error, helperText }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const hasError = Boolean(error);
  const ariaDescribedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : void 0;
  return {
    fieldId,
    hasError,
    errorId: `${fieldId}-error`,
    helperId: `${fieldId}-helper`,
    ariaDescribedBy,
    ariaInvalid: hasError
  };
}

// src/shared/input-base-styles.ts
var inputBaseStyles = {
  px: "sm",
  py: "xs",
  fontFamily: "brand",
  fontSize: "sm",
  lineHeight: "normal",
  color: "text.primary",
  bg: "background.elevated",
  border: "1px solid",
  borderColor: "border.subtle",
  borderRadius: "component.inputRadius",
  outline: "none",
  transition: "all 0.15s ease",
  _placeholder: {
    color: "text.placeholder"
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
};
var inputErrorVariant = {
  hasError: {
    true: {
      borderColor: "state.danger",
      _focus: {
        borderColor: "state.danger",
        boxShadow: "focus.danger"
      }
    }
  }
};

// src/input/Input.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var StyledInput = styled("input", {
  base: {
    ...inputBaseStyles
  },
  variants: inputErrorVariant
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
    const { fieldId, hasError, ariaDescribedBy, ariaInvalid } = useFormField({ id, error, helperText });
    return /* @__PURE__ */ jsxs(FormContainer, { className, children: [
      label && /* @__PURE__ */ jsx3(FormLabel, { htmlFor: fieldId, children: label }),
      /* @__PURE__ */ jsx3(
        StyledInput,
        {
          ref,
          id: fieldId,
          disabled,
          "aria-invalid": ariaInvalid,
          "aria-describedby": ariaDescribedBy,
          hasError,
          ...props
        }
      ),
      renderFormHelperText({ error, helperText, fieldId })
    ] });
  }
);
Input.displayName = "Input";

// src/textarea/Textarea.tsx
import { forwardRef as forwardRef4 } from "react";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var StyledTextarea = styled("textarea", {
  base: {
    ...inputBaseStyles,
    resize: "vertical"
  },
  variants: inputErrorVariant
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
    const { fieldId, hasError, ariaDescribedBy, ariaInvalid } = useFormField({ id, error, helperText });
    return /* @__PURE__ */ jsxs2(FormContainer, { className, children: [
      label && /* @__PURE__ */ jsx4(FormLabel, { htmlFor: fieldId, children: label }),
      /* @__PURE__ */ jsx4(
        StyledTextarea,
        {
          ref,
          id: fieldId,
          disabled,
          "aria-invalid": ariaInvalid,
          "aria-describedby": ariaDescribedBy,
          hasError,
          ...props
        }
      ),
      renderFormHelperText({ error, helperText, fieldId })
    ] });
  }
);
Textarea.displayName = "Textarea";

// src/search/Search.tsx
import { forwardRef as forwardRef5 } from "react";

// src/shared/Icon.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var sizeMap = {
  xs: "10px",
  sm: "12px",
  md: "14px",
  lg: "16px"
};
var Icon = ({ name, size = "md", className = "", style }) => {
  const fontSize = sizeMap[size];
  return /* @__PURE__ */ jsx5(
    "i",
    {
      className: `fa-solid fa-${name} ${className}`.trim(),
      style: { fontSize, ...style },
      "aria-hidden": "true"
    }
  );
};
Icon.displayName = "Icon";

// src/search/Search.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var InputWrapper = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  }
});
var StyledInput2 = styled("input", {
  base: {
    ...inputBaseStyles,
    width: "100%",
    pl: "xl"
  },
  variants: inputErrorVariant
});
var IconLeft = styled("span", {
  base: {
    position: "absolute",
    left: 0,
    pl: "sm",
    display: "flex",
    alignItems: "center",
    color: "text.placeholder",
    pointerEvents: "none"
  }
});
var ClearButton = styled("button", {
  base: {
    position: "absolute",
    right: 0,
    pr: "sm",
    display: "flex",
    alignItems: "center",
    color: "text.placeholder",
    cursor: "pointer",
    bg: "transparent",
    border: "none",
    padding: "xs",
    borderRadius: "component.inputRadius",
    transition: "color 0.15s ease",
    _hover: {
      color: "text.primary"
    }
  }
});
var Search = forwardRef5(
  ({
    label,
    error,
    helperText,
    disabled,
    id,
    className,
    value,
    onClear,
    ...props
  }, ref) => {
    const { fieldId, hasError, ariaDescribedBy, ariaInvalid } = useFormField({ id, error, helperText });
    const showClear = Boolean(value) && !disabled && onClear;
    return /* @__PURE__ */ jsxs3(FormContainer, { className, children: [
      label && /* @__PURE__ */ jsx6(FormLabel, { htmlFor: fieldId, children: label }),
      /* @__PURE__ */ jsxs3(InputWrapper, { children: [
        /* @__PURE__ */ jsx6(IconLeft, { children: /* @__PURE__ */ jsx6(Icon, { name: "magnifying-glass", size: "sm" }) }),
        /* @__PURE__ */ jsx6(
          StyledInput2,
          {
            ref,
            id: fieldId,
            type: "search",
            role: "searchbox",
            disabled,
            "aria-invalid": ariaInvalid,
            "aria-describedby": ariaDescribedBy,
            hasError,
            value,
            ...props
          }
        ),
        showClear && /* @__PURE__ */ jsx6(
          ClearButton,
          {
            type: "button",
            onClick: onClear,
            "aria-label": "Clear search",
            tabIndex: -1,
            children: /* @__PURE__ */ jsx6(Icon, { name: "xmark", size: "sm" })
          }
        )
      ] }),
      renderFormHelperText({ error, helperText, fieldId })
    ] });
  }
);
Search.displayName = "Search";

// src/alert/Alert.tsx
import { forwardRef as forwardRef6 } from "react";

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
import { jsx as jsx7 } from "react/jsx-runtime";
var StyledAlert = styled("div", alertRecipe);
var Alert = forwardRef6(
  ({ children, priority = "polite", ...props }, ref) => {
    return /* @__PURE__ */ jsx7(
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
import { forwardRef as forwardRef7 } from "react";

// src/spinner/spinner.recipes.ts
var spinnerRecipe = cva({
  base: {
    fontFamily: "brand",
    display: "inline-block",
    borderStyle: "solid",
    borderColor: "currentColor",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin var(--durations-spinner) linear infinite",
    // Use parent's --spinner-color if set (e.g., from Button), otherwise use semantic token
    color: "var(--spinner-color, token(colors.spinner.color))"
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
import { jsx as jsx8 } from "react/jsx-runtime";
var StyledSpinner = styled("div", spinnerRecipe);
var Spinner = forwardRef7(
  ({ label = "Loading", size, ...props }, ref) => {
    return /* @__PURE__ */ jsx8(
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
import { forwardRef as forwardRef8 } from "react";

// src/card/card.recipes.ts
var cardRecipe = cva({
  base: {
    fontFamily: "brand",
    color: "text.primary",
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
import { jsx as jsx9 } from "react/jsx-runtime";
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
var Card = forwardRef8(
  (props, ref) => {
    return /* @__PURE__ */ jsx9(StyledCard, { ref, ...props });
  }
);
Card.displayName = "Card";

// src/badge/Badge.tsx
import { forwardRef as forwardRef9 } from "react";

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
        bg: "badge.info.bg",
        color: "badge.info.text"
      },
      success: {
        bg: "badge.success.bg",
        color: "badge.success.text"
      },
      warning: {
        bg: "badge.warning.bg",
        color: "badge.warning.text"
      },
      danger: {
        bg: "badge.danger.bg",
        color: "badge.danger.text"
      },
      neutral: {
        bg: "badge.neutral.bg",
        color: "badge.neutral.text"
      }
    }
  },
  defaultVariants: {
    status: "neutral"
  }
});

// src/badge/Badge.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
var StyledBadge = styled("span", badgeRecipe);
var Badge = forwardRef9(
  (props, ref) => {
    return /* @__PURE__ */ jsx10(StyledBadge, { ref, ...props });
  }
);
Badge.displayName = "Badge";

// src/select/Select.tsx
import { forwardRef as forwardRef10 } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { jsx as jsx11, jsxs as jsxs4 } from "react/jsx-runtime";
var Trigger2 = styled(SelectPrimitive.Trigger, {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: "sm",
    py: "xs",
    fontFamily: "brand",
    fontSize: "sm",
    lineHeight: "normal",
    color: "text.primary",
    bg: "background.elevated",
    border: "1px solid",
    borderColor: "border.subtle",
    borderRadius: "component.inputRadius",
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
    fontSize: "sm",
    lineHeight: "normal",
    color: "text.primary",
    borderRadius: "sm",
    display: "flex",
    alignItems: "center",
    px: "sm",
    py: "xs",
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
var Select = forwardRef10(
  ({ label, options, value, onValueChange, placeholder, disabled, id, error, helperText }, ref) => {
    const { fieldId, hasError, ariaDescribedBy, ariaInvalid } = useFormField({ id, error, helperText });
    return /* @__PURE__ */ jsxs4(FormContainer, { children: [
      label && /* @__PURE__ */ jsx11(FormLabel, { htmlFor: fieldId, children: label }),
      /* @__PURE__ */ jsxs4(
        SelectPrimitive.Root,
        {
          value,
          onValueChange,
          disabled,
          children: [
            /* @__PURE__ */ jsxs4(
              Trigger2,
              {
                ref,
                id: fieldId,
                "aria-label": label,
                "aria-invalid": ariaInvalid,
                "aria-describedby": ariaDescribedBy,
                hasError,
                children: [
                  /* @__PURE__ */ jsx11(SelectPrimitive.Value, { placeholder }),
                  /* @__PURE__ */ jsx11(SelectPrimitive.Icon, { children: /* @__PURE__ */ jsx11(Icon, { name: "chevron-down", size: "sm" }) })
                ]
              }
            ),
            /* @__PURE__ */ jsx11(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsx11(Content2, { position: "popper", sideOffset: 4, children: /* @__PURE__ */ jsx11(Viewport2, { children: options.map((option) => /* @__PURE__ */ jsx11(
              Item2,
              {
                value: option.value,
                disabled: option.disabled,
                children: /* @__PURE__ */ jsx11(SelectPrimitive.ItemText, { children: option.label })
              },
              option.value
            )) }) }) })
          ]
        }
      ),
      renderFormHelperText({ error, helperText, fieldId })
    ] });
  }
);
Select.displayName = "Select";

// src/checkbox/Checkbox.tsx
import { forwardRef as forwardRef11 } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { jsx as jsx12, jsxs as jsxs5 } from "react/jsx-runtime";
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
    color: "checkbox.indicator",
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
var Checkbox = forwardRef11(
  ({ label, checked, defaultChecked, onCheckedChange, disabled, id, error, helperText }, ref) => {
    const { fieldId, hasError, ariaDescribedBy, ariaInvalid } = useFormField({ id, error, helperText });
    return /* @__PURE__ */ jsxs5(FormContainer, { children: [
      /* @__PURE__ */ jsxs5(FormItemContainer, { children: [
        /* @__PURE__ */ jsx12(
          StyledCheckbox,
          {
            ref,
            id: fieldId,
            checked,
            defaultChecked,
            onCheckedChange,
            disabled,
            "aria-invalid": ariaInvalid,
            "aria-describedby": ariaDescribedBy,
            hasError,
            children: /* @__PURE__ */ jsx12(Indicator2, { children: /* @__PURE__ */ jsx12(Icon, { name: "check", size: "sm" }) })
          }
        ),
        label && /* @__PURE__ */ jsx12(Label, { htmlFor: fieldId, children: label })
      ] }),
      renderFormHelperText({ error, helperText, fieldId })
    ] });
  }
);
Checkbox.displayName = "Checkbox";

// src/radio-group/RadioGroup.tsx
import { forwardRef as forwardRef12 } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { jsx as jsx13, jsxs as jsxs6 } from "react/jsx-runtime";
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
var RadioGroup = forwardRef12(
  ({ label, options, value, defaultValue, onValueChange, disabled, id, error, helperText }, ref) => {
    const { fieldId, hasError, ariaDescribedBy, ariaInvalid } = useFormField({ id, error, helperText });
    const labelId = `${fieldId}-label`;
    return /* @__PURE__ */ jsxs6(FormContainer, { children: [
      label && /* @__PURE__ */ jsx13(FormLabel, { id: labelId, children: label }),
      /* @__PURE__ */ jsx13(
        Root4,
        {
          ref,
          id: fieldId,
          value,
          defaultValue,
          onValueChange,
          disabled,
          "aria-invalid": ariaInvalid,
          "aria-labelledby": label ? labelId : void 0,
          "aria-describedby": ariaDescribedBy,
          children: options.map((option, index) => {
            const itemId = `${fieldId}-${index}`;
            return /* @__PURE__ */ jsxs6(ItemContainer, { children: [
              /* @__PURE__ */ jsx13(
                Item4,
                {
                  value: option.value,
                  id: itemId,
                  disabled: option.disabled,
                  hasError,
                  children: /* @__PURE__ */ jsx13(Indicator4, {})
                }
              ),
              /* @__PURE__ */ jsx13(ItemLabel, { htmlFor: itemId, children: option.label })
            ] }, option.value);
          })
        }
      ),
      renderFormHelperText({ error, helperText, fieldId })
    ] });
  }
);
RadioGroup.displayName = "RadioGroup";

// src/switch/Switch.tsx
import { forwardRef as forwardRef13 } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { jsx as jsx14, jsxs as jsxs7 } from "react/jsx-runtime";
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
var Switch = forwardRef13(
  ({ label, checked, defaultChecked, onCheckedChange, disabled, id, error, helperText }, ref) => {
    const { fieldId, hasError, ariaDescribedBy, ariaInvalid } = useFormField({ id, error, helperText });
    return /* @__PURE__ */ jsxs7(FormContainer, { children: [
      /* @__PURE__ */ jsxs7(FormItemContainer, { children: [
        /* @__PURE__ */ jsx14(
          Root6,
          {
            ref,
            id: fieldId,
            checked,
            defaultChecked,
            onCheckedChange,
            disabled,
            "aria-invalid": ariaInvalid,
            "aria-describedby": ariaDescribedBy,
            hasError,
            children: /* @__PURE__ */ jsx14(Thumb2, {})
          }
        ),
        label && /* @__PURE__ */ jsx14(Label2, { htmlFor: fieldId, children: label })
      ] }),
      renderFormHelperText({ error, helperText, fieldId })
    ] });
  }
);
Switch.displayName = "Switch";

// src/dialog/Dialog.tsx
import { forwardRef as forwardRef14, isValidElement } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { jsx as jsx15, jsxs as jsxs8 } from "react/jsx-runtime";
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
    padding: "lg",
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
    fontSize: "lg",
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
    marginBottom: "md"
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
var Dialog = forwardRef14(
  ({ title, description, children, trigger, open, defaultOpen, onOpenChange }, ref) => {
    if (process.env.NODE_ENV !== "production" && trigger && !isValidElement(trigger)) {
      console.warn(
        "Dialog: `trigger` prop must be a single React element. Received:",
        typeof trigger,
        trigger
      );
    }
    return /* @__PURE__ */ jsxs8(
      DialogPrimitive.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          trigger && /* @__PURE__ */ jsx15(DialogPrimitive.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsxs8(DialogPrimitive.Portal, { children: [
            /* @__PURE__ */ jsx15(Overlay2, {}),
            /* @__PURE__ */ jsxs8(Content4, { ref, children: [
              title && /* @__PURE__ */ jsx15(Title2, { children: title }),
              description && /* @__PURE__ */ jsx15(Description2, { children: description }),
              children,
              /* @__PURE__ */ jsx15(CloseButton, { "aria-label": "Close", children: /* @__PURE__ */ jsx15(Icon, { name: "xmark", size: "lg" }) })
            ] })
          ] })
        ]
      }
    );
  }
);
Dialog.displayName = "Dialog";

// src/dropdown-menu/DropdownMenu.tsx
import { forwardRef as forwardRef15, isValidElement as isValidElement2 } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { jsx as jsx16, jsxs as jsxs9 } from "react/jsx-runtime";
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
var DropdownMenu = forwardRef15(
  ({ trigger, items, open, defaultOpen, onOpenChange }, ref) => {
    if (process.env.NODE_ENV !== "production" && !isValidElement2(trigger)) {
      console.warn(
        "DropdownMenu: `trigger` prop must be a single React element. Received:",
        typeof trigger,
        trigger
      );
    }
    return /* @__PURE__ */ jsxs9(
      DropdownMenuPrimitive.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          /* @__PURE__ */ jsx16(DropdownMenuPrimitive.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsx16(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx16(Content6, { ref, sideOffset: 4, align: "start", alignOffset: -8, children: items.map((item) => /* @__PURE__ */ jsx16(
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
import { forwardRef as forwardRef16, isValidElement as isValidElement3 } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { jsx as jsx17, jsxs as jsxs10 } from "react/jsx-runtime";
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
var Tooltip = forwardRef16(
  ({ content, children, side = "top", delayDuration = 200 }, ref) => {
    if (process.env.NODE_ENV !== "production" && !isValidElement3(children)) {
      console.warn(
        "Tooltip: `children` prop must be a single React element. Received:",
        typeof children,
        children
      );
    }
    return /* @__PURE__ */ jsx17(TooltipPrimitive.Provider, { delayDuration, children: /* @__PURE__ */ jsxs10(TooltipPrimitive.Root, { children: [
      /* @__PURE__ */ jsx17(TooltipPrimitive.Trigger, { asChild: true, children }),
      /* @__PURE__ */ jsx17(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsxs10(Content8, { ref, side, sideOffset: 4, children: [
        content,
        /* @__PURE__ */ jsx17(Arrow2, {})
      ] }) })
    ] }) });
  }
);
Tooltip.displayName = "Tooltip";

// src/toast/Toast.tsx
import { forwardRef as forwardRef17 } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { jsx as jsx18, jsxs as jsxs11 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs11(
    ToastPrimitive.Provider,
    {
      label,
      duration,
      swipeThreshold,
      children: [
        children,
        /* @__PURE__ */ jsx18(Viewport4, {})
      ]
    }
  );
};
var Toast = forwardRef17(
  ({
    title,
    description,
    children,
    duration = 5e3,
    open,
    defaultOpen,
    onOpenChange
  }, ref) => {
    return /* @__PURE__ */ jsxs11(
      Root11,
      {
        ref,
        open,
        defaultOpen,
        onOpenChange,
        duration,
        children: [
          title && /* @__PURE__ */ jsx18(Title4, { children: title }),
          description && /* @__PURE__ */ jsx18(Description4, { children: description }),
          children,
          /* @__PURE__ */ jsx18(Close3, { "aria-label": "Close", children: /* @__PURE__ */ jsx18(Icon, { name: "xmark", size: "md" }) })
        ]
      }
    );
  }
);
Toast.displayName = "Toast";

// src/progress/Progress.tsx
import { forwardRef as forwardRef18 } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { jsx as jsx19 } from "react/jsx-runtime";
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
var Progress = forwardRef18(
  ({ value, max = 100, indeterminate, "aria-label": ariaLabel }, ref) => {
    const safeValue = Math.min(Math.max(value ?? 0, 0), max);
    const percentage = safeValue / max * 100;
    const progressValue = indeterminate ? void 0 : safeValue;
    return /* @__PURE__ */ jsx19(
      Root13,
      {
        ref,
        value: progressValue,
        max,
        "aria-label": ariaLabel,
        children: /* @__PURE__ */ jsx19(
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
import { forwardRef as forwardRef19 } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { jsx as jsx20 } from "react/jsx-runtime";
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
var Tabs = forwardRef19(
  ({ defaultValue, value, onValueChange, children, orientation = "horizontal" }, ref) => {
    return /* @__PURE__ */ jsx20(
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
var TabsList = forwardRef19(
  ({ children, "aria-label": ariaLabel }, ref) => {
    return /* @__PURE__ */ jsx20(List2, { ref, "aria-label": ariaLabel, children });
  }
);
TabsList.displayName = "TabsList";
var TabsTrigger = forwardRef19(
  ({ value, children, disabled }, ref) => {
    return /* @__PURE__ */ jsx20(Trigger7, { ref, value, disabled, children });
  }
);
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = forwardRef19(
  ({ value, children }, ref) => {
    return /* @__PURE__ */ jsx20(Content10, { ref, value, children });
  }
);
TabsContent.displayName = "TabsContent";

// src/accordion/Accordion.tsx
import { forwardRef as forwardRef20 } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { jsx as jsx21, jsxs as jsxs12 } from "react/jsx-runtime";
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
var Accordion = forwardRef20(
  (props, ref) => {
    if (props.type === "multiple") {
      return /* @__PURE__ */ jsx21(
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
    return /* @__PURE__ */ jsx21(
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
var AccordionItem = forwardRef20(
  ({ value, children, disabled }, ref) => {
    return /* @__PURE__ */ jsx21(Item8, { ref, value, disabled, children });
  }
);
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = forwardRef20(
  ({ children }, ref) => {
    return /* @__PURE__ */ jsx21(Header2, { children: /* @__PURE__ */ jsxs12(Trigger9, { ref, children: [
      children,
      /* @__PURE__ */ jsx21(ChevronIcon, { "aria-hidden": true, children: /* @__PURE__ */ jsx21(Icon, { name: "chevron-down", size: "md" }) })
    ] }) });
  }
);
AccordionTrigger.displayName = "AccordionTrigger";
var AccordionContent = forwardRef20(
  ({ children }, ref) => {
    return /* @__PURE__ */ jsx21(Content12, { ref, children: /* @__PURE__ */ jsx21(ContentInner, { children }) });
  }
);
AccordionContent.displayName = "AccordionContent";

// src/popover/Popover.tsx
import { forwardRef as forwardRef21, isValidElement as isValidElement4 } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { jsx as jsx22, jsxs as jsxs13 } from "react/jsx-runtime";
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
var Popover = forwardRef21(
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
    return /* @__PURE__ */ jsxs13(
      PopoverPrimitive.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          trigger && /* @__PURE__ */ jsx22(PopoverPrimitive.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsx22(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsxs13(
            Content14,
            {
              ref,
              sideOffset,
              alignOffset,
              children: [
                children,
                showArrow && /* @__PURE__ */ jsx22(Arrow4, {}),
                /* @__PURE__ */ jsx22(Close5, { "aria-label": "Close", children: /* @__PURE__ */ jsx22(Icon, { name: "xmark", size: "sm" }) })
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
import { forwardRef as forwardRef22 } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { jsx as jsx23 } from "react/jsx-runtime";
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
var Separator = forwardRef22(
  ({ orientation = "horizontal", decorative = true, ...props }, ref) => {
    return /* @__PURE__ */ jsx23(
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
import { forwardRef as forwardRef23 } from "react";
import { jsx as jsx24 } from "react/jsx-runtime";
var Grid = forwardRef23(
  ({ columns, gap, columnGap, rowGap, minChildWidth, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx24(
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
import { forwardRef as forwardRef24 } from "react";
import { jsx as jsx25 } from "react/jsx-runtime";
var GridItem = forwardRef24(
  ({ colSpan, rowSpan, colStart, rowStart, colEnd, rowEnd, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx25(
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
  forwardRef as forwardRef26,
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
import { Fragment as Fragment2, jsx as jsx26 } from "react/jsx-runtime";
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
      return /* @__PURE__ */ jsx26(SlotClone, { ...slotProps, ref: forwardedRef, children: React2.isValidElement(newElement) ? React2.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx26(SlotClone, { ...slotProps, ref: forwardedRef, children });
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
import { jsx as jsx27, jsxs as jsxs14 } from "react/jsx-runtime";
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
var Breadcrumbs = forwardRef26(
  ({ separator = "/", children, ...props }, ref) => {
    const items = Children2.toArray(children).filter(isValidElement6);
    return /* @__PURE__ */ jsx27(BreadcrumbNav, { ref, "aria-label": "Breadcrumb", ...props, children: /* @__PURE__ */ jsx27(BreadcrumbList, { children: items.map((child, index) => {
      const isLast = index === items.length - 1;
      return /* @__PURE__ */ jsxs14("li", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
        cloneElement2(child, {
          isCurrentPage: isLast
        }),
        !isLast && /* @__PURE__ */ jsx27(BreadcrumbSeparator, { children: separator })
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
    color: "text.secondary",
    '&[aria-current="page"]': {
      color: "text.primary",
      fontWeight: "medium"
    }
  }
});
var BreadcrumbItem = forwardRef26(
  ({ isCurrentPage, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx27(
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
    color: "text.linkColor",
    textDecoration: "none",
    transition: "color 0.12s ease",
    "&:hover": {
      color: "text.linkHover",
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
var BreadcrumbLink = forwardRef26(
  ({ asChild, children, ...props }, ref) => {
    if (asChild) {
      return /* @__PURE__ */ jsx27(Slot, { ref, ...props, children });
    }
    return /* @__PURE__ */ jsx27(BreadcrumbAnchor, { ref, ...props, children });
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";
var SeparatorRoot = styled("span", {
  base: {
    color: "breadcrumb.separator",
    fontSize: "sm",
    userSelect: "none"
  }
});
var BreadcrumbSeparator = forwardRef26(
  ({ children = "/", ...props }, ref) => {
    return /* @__PURE__ */ jsx27(SeparatorRoot, { ref, "aria-hidden": "true", ...props, children });
  }
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// src/pagination/Pagination.tsx
import { forwardRef as forwardRef27, useMemo as useMemo2 } from "react";

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
    borderColor: "border.default",
    bg: "background.base",
    color: "text.primary",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.12s ease",
    userSelect: "none",
    _hover: {
      bg: "background.subtle",
      borderColor: "border.emphasis"
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
import { jsx as jsx28, jsxs as jsxs15 } from "react/jsx-runtime";
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
var PaginationButton = forwardRef27(
  ({ isActive, disabled, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx28(
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
var PaginationEllipsis = forwardRef27(
  (props, ref) => {
    return /* @__PURE__ */ jsx28(EllipsisContainer, { ref, "aria-hidden": "true", ...props, children: "..." });
  }
);
PaginationEllipsis.displayName = "PaginationEllipsis";
var Pagination = forwardRef27(
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
    return /* @__PURE__ */ jsxs15(PaginationRoot, { ref, "aria-label": "Pagination", ...props, children: [
      showFirstLast && /* @__PURE__ */ jsx28(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(1),
          disabled: currentPage === 1,
          "aria-label": "Go to first page",
          children: /* @__PURE__ */ jsx28(Icon, { name: "angles-left", size: "lg" })
        }
      ),
      /* @__PURE__ */ jsx28(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(currentPage - 1),
          disabled: currentPage === 1,
          "aria-label": "Go to previous page",
          children: /* @__PURE__ */ jsx28(Icon, { name: "chevron-left", size: "lg" })
        }
      ),
      pages.map(
        (page, index) => page === "ellipsis" ? /* @__PURE__ */ jsx28(PaginationEllipsis, {}, `ellipsis-${index}`) : /* @__PURE__ */ jsx28(
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
      /* @__PURE__ */ jsx28(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(currentPage + 1),
          disabled: currentPage === totalPages,
          "aria-label": "Go to next page",
          children: /* @__PURE__ */ jsx28(Icon, { name: "chevron-right", size: "lg" })
        }
      ),
      showFirstLast && /* @__PURE__ */ jsx28(
        "button",
        {
          type: "button",
          className: paginationButtonRecipe({ variant: "nav" }),
          onClick: () => handlePageChange(totalPages),
          disabled: currentPage === totalPages,
          "aria-label": "Go to last page",
          children: /* @__PURE__ */ jsx28(Icon, { name: "angles-right", size: "lg" })
        }
      )
    ] });
  }
);
Pagination.displayName = "Pagination";

// src/side-panel/SidePanel.tsx
import { forwardRef as forwardRef28, isValidElement as isValidElement7 } from "react";
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
import { jsx as jsx29, jsxs as jsxs16 } from "react/jsx-runtime";
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
var SidePanel = forwardRef28(
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
    return /* @__PURE__ */ jsxs16(
      DialogPrimitive2.Root,
      {
        open,
        defaultOpen,
        onOpenChange,
        children: [
          trigger && /* @__PURE__ */ jsx29(DialogPrimitive2.Trigger, { asChild: true, children: trigger }),
          /* @__PURE__ */ jsxs16(DialogPrimitive2.Portal, { children: [
            /* @__PURE__ */ jsx29(Overlay4, {}),
            /* @__PURE__ */ jsxs16(
              DialogPrimitive2.Content,
              {
                ref,
                className: sidePanelContentRecipe({ side, size }),
                children: [
                  /* @__PURE__ */ jsx29(CloseButton2, { "aria-label": "Close panel", children: /* @__PURE__ */ jsx29(Icon, { name: "xmark", size: "lg" }) }),
                  (title || description) && /* @__PURE__ */ jsxs16(Header3, { children: [
                    title && /* @__PURE__ */ jsx29(Title6, { children: title }),
                    description && /* @__PURE__ */ jsx29(Description6, { children: description })
                  ] }),
                  /* @__PURE__ */ jsx29(Body, { children })
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
import { forwardRef as forwardRef29, useEffect, useState } from "react";
import { jsx as jsx30, jsxs as jsxs17 } from "react/jsx-runtime";
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
    lineHeight: "normal",
    bg: "background.base"
  }
});
var TableHead = styled("thead", {
  base: {
    bg: "table.header.bg",
    color: "table.header.text",
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
    color: "table.header.text",
    fontSize: "sm",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    userSelect: "none",
    transition: "all 0.15s ease",
    _hover: {
      bg: "accent.dark"
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
  return /* @__PURE__ */ jsx30(TableContainer, { ref, children: /* @__PURE__ */ jsxs17(StyledTable, { children: [
    /* @__PURE__ */ jsx30(TableHead, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx30("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx30(
      TableHeaderCell,
      {
        onClick: header.column.getToggleSortingHandler(),
        sortable: header.column.getCanSort(),
        children: header.isPlaceholder ? null : /* @__PURE__ */ jsxs17(HeaderCellContent, { children: [
          flexRender(
            header.column.columnDef.header,
            header.getContext()
          ),
          header.column.getIsSorted() && /* @__PURE__ */ jsx30(
            Icon,
            {
              name: header.column.getIsSorted() === "asc" ? "arrow-up" : "arrow-down",
              size: "sm"
            }
          )
        ] })
      },
      header.id
    )) }, headerGroup.id)) }),
    /* @__PURE__ */ jsx30(TableBody, { children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx30(
      TableRow,
      {
        "data-selected": row.getIsSelected(),
        children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx30(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
      },
      row.id
    )) })
  ] }) });
}
TableComponent.displayName = "Table";
var Table = forwardRef29(TableComponent);

// src/event-calendar/EventCalendar.tsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { forwardRef as forwardRef30 } from "react";

// styled-system/tokens/index.mjs
var tokens = {
  "colors.brand.primary": {
    "value": "#EF3F32",
    "variable": "var(--colors-brand\\.primary)"
  },
  "colors.brand.hover": {
    "value": "#CC170A",
    "variable": "var(--colors-brand\\.hover)"
  },
  "colors.brand.dark": {
    "value": "#323433",
    "variable": "var(--colors-brand\\.dark)"
  },
  "colors.neutral.dark": {
    "value": "#323433",
    "variable": "var(--colors-neutral\\.dark)"
  },
  "colors.neutral.base": {
    "value": "#AEAEAE",
    "variable": "var(--colors-neutral\\.base)"
  },
  "colors.neutral.light": {
    "value": "#F4F4F4",
    "variable": "var(--colors-neutral\\.light)"
  },
  "colors.neutral.soft": {
    "value": "#BDBDBD",
    "variable": "var(--colors-neutral\\.soft)"
  },
  "colors.data.blue": {
    "value": "#2563eb",
    "variable": "var(--colors-data\\.blue)"
  },
  "colors.data.blue-dark": {
    "value": "#60a5fa",
    "variable": "var(--colors-data\\.blue-dark)"
  },
  "colors.data.blue-bg": {
    "value": "#dbeafe",
    "variable": "var(--colors-data\\.blue-bg)"
  },
  "colors.data.purple": {
    "value": "#9333ea",
    "variable": "var(--colors-data\\.purple)"
  },
  "colors.data.purple-dark": {
    "value": "#a78bfa",
    "variable": "var(--colors-data\\.purple-dark)"
  },
  "colors.data.purple-bg": {
    "value": "#f3e8ff",
    "variable": "var(--colors-data\\.purple-bg)"
  },
  "colors.data.yellow": {
    "value": "#eab308",
    "variable": "var(--colors-data\\.yellow)"
  },
  "colors.data.yellow-dark": {
    "value": "#facc15",
    "variable": "var(--colors-data\\.yellow-dark)"
  },
  "colors.data.yellow-bg": {
    "value": "#fef9c3",
    "variable": "var(--colors-data\\.yellow-bg)"
  },
  "colors.data.pink": {
    "value": "#ec4899",
    "variable": "var(--colors-data\\.pink)"
  },
  "colors.data.pink-dark": {
    "value": "#f472b6",
    "variable": "var(--colors-data\\.pink-dark)"
  },
  "colors.data.pink-bg": {
    "value": "#fce7f3",
    "variable": "var(--colors-data\\.pink-bg)"
  },
  "colors.data.orange": {
    "value": "#f97316",
    "variable": "var(--colors-data\\.orange)"
  },
  "colors.data.orange-dark": {
    "value": "#fb923c",
    "variable": "var(--colors-data\\.orange-dark)"
  },
  "colors.data.orange-bg": {
    "value": "#ffedd5",
    "variable": "var(--colors-data\\.orange-bg)"
  },
  "colors.bg.base": {
    "value": "#FFFFFF",
    "variable": "var(--colors-bg\\.base)"
  },
  "colors.bg.subtle": {
    "value": "#ECECEC",
    "variable": "var(--colors-bg\\.subtle)"
  },
  "colors.bg.elevated": {
    "value": "#FFFFFF",
    "variable": "var(--colors-bg\\.elevated)"
  },
  "colors.border.subtle": {
    "value": "#F4F4F4",
    "variable": "var(--colors-border\\.subtle)"
  },
  "colors.border.strong": {
    "value": "#A2A2A2",
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
    "value": "#EF3F32",
    "variable": "var(--colors-state\\.danger)"
  },
  "colors.text.main": {
    "value": "#000000",
    "variable": "var(--colors-text\\.main)"
  },
  "colors.text.subtle": {
    "value": "#5F5F5F",
    "variable": "var(--colors-text\\.subtle)"
  },
  "colors.text.on-dark": {
    "value": "#FFFFFF",
    "variable": "var(--colors-text\\.on-dark)"
  },
  "colors.text.link": {
    "value": "#EF3F32",
    "variable": "var(--colors-text\\.link)"
  },
  "colors.text.link-hover": {
    "value": "#CC170A",
    "variable": "var(--colors-text\\.link-hover)"
  },
  "colors.text.muted": {
    "value": "#C3C3C3",
    "variable": "var(--colors-text\\.muted)"
  },
  "colors.text.placeholder": {
    "value": "#989898",
    "variable": "var(--colors-text\\.placeholder)"
  },
  "colors.dark-bg.base": {
    "value": "#1a1a1a",
    "variable": "var(--colors-dark-bg\\.base)"
  },
  "colors.dark-bg.subtle": {
    "value": "#262626",
    "variable": "var(--colors-dark-bg\\.subtle)"
  },
  "colors.dark-bg.elevated": {
    "value": "#2d2d2d",
    "variable": "var(--colors-dark-bg\\.elevated)"
  },
  "colors.dark-text.main": {
    "value": "#f5f5f5",
    "variable": "var(--colors-dark-text\\.main)"
  },
  "colors.dark-text.subtle": {
    "value": "#a3a3a3",
    "variable": "var(--colors-dark-text\\.subtle)"
  },
  "colors.dark-text.link": {
    "value": "#33c5db",
    "variable": "var(--colors-dark-text\\.link)"
  },
  "colors.dark-text.link-hover": {
    "value": "#66d4e6",
    "variable": "var(--colors-dark-text\\.link-hover)"
  },
  "colors.dark-border.subtle": {
    "value": "#404040",
    "variable": "var(--colors-dark-border\\.subtle)"
  },
  "colors.dark-border.strong": {
    "value": "#525252",
    "variable": "var(--colors-dark-border\\.strong)"
  },
  "colors.state-hover.danger": {
    "value": "#CC170A",
    "variable": "var(--colors-state-hover\\.danger)"
  },
  "fonts.brand": {
    "value": '"Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    "variable": "var(--fonts-brand)"
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
    "value": "36px",
    "variable": "var(--font-sizes-2xl)"
  },
  "fontSizes.3xl": {
    "value": "50px",
    "variable": "var(--font-sizes-3xl)"
  },
  "fontSizes.4xl": {
    "value": "70px",
    "variable": "var(--font-sizes-4xl)"
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
  "radii.sm": {
    "value": "4px",
    "variable": "var(--radii-sm)"
  },
  "radii.md": {
    "value": "8px",
    "variable": "var(--radii-md)"
  },
  "radii.lg": {
    "value": "10px",
    "variable": "var(--radii-lg)"
  },
  "radii.pill": {
    "value": "9999px",
    "variable": "var(--radii-pill)"
  },
  "shadows.soft": {
    "value": "0 2px 6px rgba(0, 0, 0, 0.08)",
    "variable": "var(--shadows-soft)"
  },
  "shadows.strong": {
    "value": "0 6px 24px rgba(0, 0, 0, 0.12)",
    "variable": "var(--shadows-strong)"
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
    "value": "50px",
    "variable": "var(--sizes-button\\.min-height)"
  },
  "sizes.button.sm.min-height": {
    "value": "40px",
    "variable": "var(--sizes-button\\.sm\\.min-height)"
  },
  "sizes.button.lg.min-height": {
    "value": "59px",
    "variable": "var(--sizes-button\\.lg\\.min-height)"
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
    "value": "var(--colors-brand\\.primary)",
    "variable": "var(--colors-accent\\.primary)"
  },
  "colors.accent.secondary": {
    "value": "var(--colors-brand\\.hover)",
    "variable": "var(--colors-accent\\.secondary)"
  },
  "colors.accent.dark": {
    "value": "var(--colors-accent\\.dark)",
    "variable": "var(--colors-accent\\.dark)"
  },
  "colors.text.primary": {
    "value": "var(--colors-text\\.primary)",
    "variable": "var(--colors-text\\.primary)"
  },
  "colors.text.secondary": {
    "value": "var(--colors-text\\.secondary)",
    "variable": "var(--colors-text\\.secondary)"
  },
  "colors.text.linkColor": {
    "value": "var(--colors-text\\.link-color)",
    "variable": "var(--colors-text\\.link-color)"
  },
  "colors.text.linkHover": {
    "value": "var(--colors-text\\.link-hover)",
    "variable": "var(--colors-text\\.link-hover)"
  },
  "colors.background.base": {
    "value": "var(--colors-background\\.base)",
    "variable": "var(--colors-background\\.base)"
  },
  "colors.background.subtle": {
    "value": "var(--colors-background\\.subtle)",
    "variable": "var(--colors-background\\.subtle)"
  },
  "colors.background.elevated": {
    "value": "var(--colors-background\\.elevated)",
    "variable": "var(--colors-background\\.elevated)"
  },
  "colors.button.primary.bg": {
    "value": "var(--colors-brand\\.primary)",
    "variable": "var(--colors-button\\.primary\\.bg)"
  },
  "colors.button.primary.bgHover": {
    "value": "var(--colors-brand\\.hover)",
    "variable": "var(--colors-button\\.primary\\.bg-hover)"
  },
  "colors.button.primary.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-button\\.primary\\.text)"
  },
  "colors.button.dark.bg": {
    "value": "var(--colors-brand\\.dark)",
    "variable": "var(--colors-button\\.dark\\.bg)"
  },
  "colors.button.dark.bgHover": {
    "value": "#000000",
    "variable": "var(--colors-button\\.dark\\.bg-hover)"
  },
  "colors.button.dark.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-button\\.dark\\.text)"
  },
  "colors.button.outlined.border": {
    "value": "var(--colors-neutral\\.base)",
    "variable": "var(--colors-button\\.outlined\\.border)"
  },
  "colors.button.outlined.bgHover": {
    "value": "var(--colors-neutral\\.base)",
    "variable": "var(--colors-button\\.outlined\\.bg-hover)"
  },
  "colors.button.outlined.text": {
    "value": "#000000",
    "variable": "var(--colors-button\\.outlined\\.text)"
  },
  "colors.button.ghost.bgHover": {
    "value": "var(--colors-neutral\\.soft)",
    "variable": "var(--colors-button\\.ghost\\.bg-hover)"
  },
  "colors.table.header.bg": {
    "value": "var(--colors-brand\\.dark)",
    "variable": "var(--colors-table\\.header\\.bg)"
  },
  "colors.table.header.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-table\\.header\\.text)"
  },
  "colors.alert.info.bg": {
    "value": "var(--colors-alert\\.info\\.bg)",
    "variable": "var(--colors-alert\\.info\\.bg)"
  },
  "colors.alert.info.border": {
    "value": "var(--colors-state\\.info)",
    "variable": "var(--colors-alert\\.info\\.border)"
  },
  "colors.alert.info.text": {
    "value": "var(--colors-alert\\.info\\.text)",
    "variable": "var(--colors-alert\\.info\\.text)"
  },
  "colors.alert.success.bg": {
    "value": "var(--colors-alert\\.success\\.bg)",
    "variable": "var(--colors-alert\\.success\\.bg)"
  },
  "colors.alert.success.border": {
    "value": "var(--colors-state\\.success)",
    "variable": "var(--colors-alert\\.success\\.border)"
  },
  "colors.alert.success.text": {
    "value": "var(--colors-alert\\.success\\.text)",
    "variable": "var(--colors-alert\\.success\\.text)"
  },
  "colors.alert.warning.bg": {
    "value": "var(--colors-alert\\.warning\\.bg)",
    "variable": "var(--colors-alert\\.warning\\.bg)"
  },
  "colors.alert.warning.border": {
    "value": "var(--colors-state\\.warning)",
    "variable": "var(--colors-alert\\.warning\\.border)"
  },
  "colors.alert.warning.text": {
    "value": "var(--colors-alert\\.warning\\.text)",
    "variable": "var(--colors-alert\\.warning\\.text)"
  },
  "colors.alert.danger.bg": {
    "value": "var(--colors-alert\\.danger\\.bg)",
    "variable": "var(--colors-alert\\.danger\\.bg)"
  },
  "colors.alert.danger.border": {
    "value": "var(--colors-state\\.danger)",
    "variable": "var(--colors-alert\\.danger\\.border)"
  },
  "colors.alert.danger.text": {
    "value": "var(--colors-alert\\.danger\\.text)",
    "variable": "var(--colors-alert\\.danger\\.text)"
  },
  "colors.toast.bg": {
    "value": "var(--colors-toast\\.bg)",
    "variable": "var(--colors-toast\\.bg)"
  },
  "colors.toast.text": {
    "value": "var(--colors-toast\\.text)",
    "variable": "var(--colors-toast\\.text)"
  },
  "colors.toast.border": {
    "value": "var(--colors-toast\\.border)",
    "variable": "var(--colors-toast\\.border)"
  },
  "colors.toast.closeHover": {
    "value": "var(--colors-toast\\.close-hover)",
    "variable": "var(--colors-toast\\.close-hover)"
  },
  "colors.progress.bg": {
    "value": "var(--colors-progress\\.bg)",
    "variable": "var(--colors-progress\\.bg)"
  },
  "colors.progress.fill": {
    "value": "var(--colors-brand\\.primary)",
    "variable": "var(--colors-progress\\.fill)"
  },
  "colors.spinner.color": {
    "value": "var(--colors-spinner\\.color)",
    "variable": "var(--colors-spinner\\.color)"
  },
  "colors.tabs.active.border": {
    "value": "var(--colors-brand\\.primary)",
    "variable": "var(--colors-tabs\\.active\\.border)"
  },
  "colors.tabs.active.text": {
    "value": "var(--colors-brand\\.primary)",
    "variable": "var(--colors-tabs\\.active\\.text)"
  },
  "colors.tabs.inactive.text": {
    "value": "var(--colors-tabs\\.inactive\\.text)",
    "variable": "var(--colors-tabs\\.inactive\\.text)"
  },
  "colors.tabs.hover.bg": {
    "value": "var(--colors-tabs\\.hover\\.bg)",
    "variable": "var(--colors-tabs\\.hover\\.bg)"
  },
  "colors.accordion.trigger.hover": {
    "value": "var(--colors-accordion\\.trigger\\.hover)",
    "variable": "var(--colors-accordion\\.trigger\\.hover)"
  },
  "colors.accordion.content.bg": {
    "value": "var(--colors-accordion\\.content\\.bg)",
    "variable": "var(--colors-accordion\\.content\\.bg)"
  },
  "colors.popover.bg": {
    "value": "var(--colors-popover\\.bg)",
    "variable": "var(--colors-popover\\.bg)"
  },
  "colors.popover.border": {
    "value": "var(--colors-popover\\.border)",
    "variable": "var(--colors-popover\\.border)"
  },
  "colors.tooltip.bg": {
    "value": "var(--colors-tooltip\\.bg)",
    "variable": "var(--colors-tooltip\\.bg)"
  },
  "colors.tooltip.text": {
    "value": "var(--colors-tooltip\\.text)",
    "variable": "var(--colors-tooltip\\.text)"
  },
  "colors.overlay.modal": {
    "value": "var(--colors-overlay\\.modal)",
    "variable": "var(--colors-overlay\\.modal)"
  },
  "colors.selection.bg": {
    "value": "var(--colors-selection\\.bg)",
    "variable": "var(--colors-selection\\.bg)"
  },
  "colors.border.default": {
    "value": "var(--colors-border\\.default)",
    "variable": "var(--colors-border\\.default)"
  },
  "colors.border.emphasis": {
    "value": "var(--colors-border\\.emphasis)",
    "variable": "var(--colors-border\\.emphasis)"
  },
  "colors.badge.info.bg": {
    "value": "var(--colors-state\\.info)",
    "variable": "var(--colors-badge\\.info\\.bg)"
  },
  "colors.badge.info.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-badge\\.info\\.text)"
  },
  "colors.badge.success.bg": {
    "value": "var(--colors-state\\.success)",
    "variable": "var(--colors-badge\\.success\\.bg)"
  },
  "colors.badge.success.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-badge\\.success\\.text)"
  },
  "colors.badge.warning.bg": {
    "value": "var(--colors-state\\.warning)",
    "variable": "var(--colors-badge\\.warning\\.bg)"
  },
  "colors.badge.warning.text": {
    "value": "var(--colors-neutral\\.dark)",
    "variable": "var(--colors-badge\\.warning\\.text)"
  },
  "colors.badge.danger.bg": {
    "value": "var(--colors-state\\.danger)",
    "variable": "var(--colors-badge\\.danger\\.bg)"
  },
  "colors.badge.danger.text": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-badge\\.danger\\.text)"
  },
  "colors.badge.neutral.bg": {
    "value": "var(--colors-badge\\.neutral\\.bg)",
    "variable": "var(--colors-badge\\.neutral\\.bg)"
  },
  "colors.badge.neutral.text": {
    "value": "var(--colors-badge\\.neutral\\.text)",
    "variable": "var(--colors-badge\\.neutral\\.text)"
  },
  "colors.breadcrumb.separator": {
    "value": "var(--colors-breadcrumb\\.separator)",
    "variable": "var(--colors-breadcrumb\\.separator)"
  },
  "colors.checkbox.indicator": {
    "value": "var(--colors-text\\.on-dark)",
    "variable": "var(--colors-checkbox\\.indicator)"
  },
  "colors.chart.text.primary": {
    "value": "var(--colors-chart\\.text\\.primary)",
    "variable": "var(--colors-chart\\.text\\.primary)"
  },
  "colors.chart.text.secondary": {
    "value": "var(--colors-chart\\.text\\.secondary)",
    "variable": "var(--colors-chart\\.text\\.secondary)"
  },
  "colors.chart.gridLine": {
    "value": "var(--colors-chart\\.grid-line)",
    "variable": "var(--colors-chart\\.grid-line)"
  },
  "colors.chart.background": {
    "value": "var(--colors-chart\\.background)",
    "variable": "var(--colors-chart\\.background)"
  },
  "colors.chart.tooltip.bg": {
    "value": "var(--colors-chart\\.tooltip\\.bg)",
    "variable": "var(--colors-chart\\.tooltip\\.bg)"
  },
  "colors.chart.tooltip.text": {
    "value": "var(--colors-chart\\.tooltip\\.text)",
    "variable": "var(--colors-chart\\.tooltip\\.text)"
  },
  "colors.chart.data.blue": {
    "value": "var(--colors-chart\\.data\\.blue)",
    "variable": "var(--colors-chart\\.data\\.blue)"
  },
  "colors.chart.data.purple": {
    "value": "var(--colors-chart\\.data\\.purple)",
    "variable": "var(--colors-chart\\.data\\.purple)"
  },
  "colors.chart.data.yellow": {
    "value": "var(--colors-chart\\.data\\.yellow)",
    "variable": "var(--colors-chart\\.data\\.yellow)"
  },
  "colors.chart.data.pink": {
    "value": "var(--colors-chart\\.data\\.pink)",
    "variable": "var(--colors-chart\\.data\\.pink)"
  },
  "colors.chart.data.orange": {
    "value": "var(--colors-chart\\.data\\.orange)",
    "variable": "var(--colors-chart\\.data\\.orange)"
  },
  "colors.chart.data.bg.blue": {
    "value": "var(--colors-data\\.blue-bg)",
    "variable": "var(--colors-chart\\.data\\.bg\\.blue)"
  },
  "colors.chart.data.bg.purple": {
    "value": "var(--colors-data\\.purple-bg)",
    "variable": "var(--colors-chart\\.data\\.bg\\.purple)"
  },
  "colors.chart.data.bg.yellow": {
    "value": "var(--colors-data\\.yellow-bg)",
    "variable": "var(--colors-chart\\.data\\.bg\\.yellow)"
  },
  "colors.chart.data.bg.pink": {
    "value": "var(--colors-data\\.pink-bg)",
    "variable": "var(--colors-chart\\.data\\.bg\\.pink)"
  },
  "colors.chart.data.bg.orange": {
    "value": "var(--colors-data\\.orange-bg)",
    "variable": "var(--colors-chart\\.data\\.bg\\.orange)"
  },
  "radii.component.buttonRadius": {
    "value": "var(--radii-sm)",
    "variable": "var(--radii-component\\.button-radius)"
  },
  "radii.component.inputRadius": {
    "value": "var(--radii-sm)",
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
    "value": "var(--shadows-focus\\.primary)",
    "variable": "var(--shadows-focus\\.primary)"
  },
  "shadows.focus.dialog": {
    "value": "var(--shadows-focus\\.dialog)",
    "variable": "var(--shadows-focus\\.dialog)"
  },
  "shadows.focus.danger": {
    "value": "var(--shadows-focus\\.danger)",
    "variable": "var(--shadows-focus\\.danger)"
  },
  "shadows.focus.button": {
    "value": "var(--shadows-focus\\.button)",
    "variable": "var(--shadows-focus\\.button)"
  },
  "shadows.focus.light": {
    "value": "var(--shadows-focus\\.light)",
    "variable": "var(--shadows-focus\\.light)"
  },
  "sizes.component.buttonMinHeight": {
    "value": "var(--sizes-button\\.min-height)",
    "variable": "var(--sizes-component\\.button-min-height)"
  },
  "sizes.component.buttonSmMinHeight": {
    "value": "var(--sizes-button\\.sm\\.min-height)",
    "variable": "var(--sizes-component\\.button-sm-min-height)"
  },
  "sizes.component.buttonLgMinHeight": {
    "value": "var(--sizes-button\\.lg\\.min-height)",
    "variable": "var(--sizes-component\\.button-lg-min-height)"
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
import { jsx as jsx31 } from "react/jsx-runtime";
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
    "& .fc-daygrid-block-event .fc-event-title, & .fc-daygrid-block-event .fc-event-time": {
      color: "text.on-dark"
    },
    "& .fc-daygrid-dot-event .fc-event-title, & .fc-daygrid-dot-event .fc-event-time": {
      color: "text.primary"
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
  return /* @__PURE__ */ jsx31(CalendarContainer, { ref, children: /* @__PURE__ */ jsx31(
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
var EventCalendar = forwardRef30(EventCalendarComponent);

// src/gantt-chart/GanttChart.tsx
import { Editor, Gantt, Tooltip as Tooltip2 } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";
import { forwardRef as forwardRef31, useCallback as useCallback2, useEffect as useEffect2, useRef, useState as useState2 } from "react";
import { jsx as jsx32, jsxs as jsxs18 } from "react/jsx-runtime";
var defaultColumns = [
  { id: "text", header: "Task", width: 150 },
  { id: "start", header: "Start date", width: 90 },
  { id: "duration", header: "Duration", width: 70 }
];
var priorityTokens = { high: "colors.state.danger", medium: "colors.state.warning", low: "colors.state.success" };
var getPriorityColor = (priority) => priority ? token(priorityTokens[priority]) : token("colors.accent.primary");
var TaskTemplate = ({ data: task }) => {
  if (task.type === "milestone") return null;
  const progress = task.progress ?? 0;
  const radiusSm = token("radii.sm");
  return /* @__PURE__ */ jsxs18("div", { className: "wx-bar wx-task", style: {
    width: "100%",
    height: "100%",
    backgroundColor: getPriorityColor(task.priority),
    opacity: task.type === "project" ? 0.85 : 1,
    borderRadius: radiusSm,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    paddingLeft: "8px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden"
  }, children: [
    progress > 0 && progress < 100 && /* @__PURE__ */ jsx32("div", { style: {
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      width: `${progress}%`,
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: radiusSm
    } }),
    /* @__PURE__ */ jsx32("span", { style: {
      position: "relative",
      zIndex: 1,
      fontSize: token("fontSizes.xs"),
      fontWeight: 500,
      textShadow: "0 1px 1px rgba(0,0,0,0.2)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }, children: task.text })
  ] });
};
var scrollNavStyles = css({
  position: "absolute",
  top: "8px",
  right: "20px",
  display: "flex",
  gap: "4px",
  zIndex: 10
});
var scrollButtonStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  padding: "0 !important",
  borderRadius: "sm",
  border: "1px solid",
  borderColor: "border.subtle",
  bg: "background.base",
  color: "text.secondary",
  cursor: "pointer",
  transition: "all 0.15s ease",
  _hover: {
    bg: "background.subtle",
    borderColor: "border.strong",
    color: "text.primary"
  },
  _disabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    _hover: {
      bg: "background.base",
      borderColor: "border.subtle",
      color: "text.secondary"
    }
  }
});
var ChevronIcon2 = ({ direction }) => /* @__PURE__ */ jsx32("i", { className: `fa-solid fa-chevron-${direction}`, style: { fontSize: "12px" } });
var t = {
  accent: token("colors.accent.primary"),
  accentSecondary: token("colors.accent.secondary"),
  bgBase: token("colors.background.base"),
  bgSubtle: token("colors.background.subtle"),
  bgElevated: token("colors.background.elevated"),
  borderSubtle: token("colors.border.subtle"),
  borderStrong: token("colors.border.strong"),
  textPrimary: token("colors.text.primary"),
  textSecondary: token("colors.text.secondary"),
  neutralBase: token("colors.neutral.base"),
  neutralLight: token("colors.neutral.light"),
  btnPrimaryBg: token("colors.button.primary.bg"),
  btnPrimaryText: token("colors.button.primary.text"),
  btnPrimaryHover: token("colors.button.primary.bgHover"),
  stateDanger: token("colors.state.danger"),
  fontBrand: token("fonts.brand"),
  fontSm: token("fontSizes.sm"),
  fontXs: token("fontSizes.xs"),
  fontMd: token("fontSizes.md"),
  radiusSm: token("radii.sm"),
  radiusMd: token("radii.md"),
  radiusLg: token("radii.lg"),
  spacingXs: token("spacing.xs"),
  spacingSm: token("spacing.sm"),
  spacingMd: token("spacing.md"),
  spacingLg: token("spacing.lg"),
  spacing2xs: token("spacing.2xs")
};
var border1Subtle = `1px solid ${t.borderSubtle}`;
var ganttGridBorder = "1px solid rgba(128, 128, 128, 0.25)";
var svarCssVariables = {
  // Gantt-specific
  "--wx-gantt-task-color": t.accent,
  "--wx-gantt-task-font-color": t.btnPrimaryText,
  "--wx-gantt-task-fill-color": t.accent,
  "--wx-gantt-task-border-color": t.accent,
  "--wx-gantt-project-color": t.accentSecondary,
  "--wx-gantt-milestone-color": t.accent,
  "--wx-gantt-bar-border-radius": t.radiusSm,
  "--wx-gantt-link-color": t.borderStrong,
  "--wx-gantt-progress-marker-height": "8px",
  "--wx-gantt-holiday-background": t.bgSubtle,
  "--wx-gantt-border-color": "rgba(128, 128, 128, 0.25)",
  "--wx-gantt-form-header-border": border1Subtle,
  "--wx-gantt-icon-color": t.textSecondary,
  // Chart area grid lines
  "--wx-gantt-cell-border": "rgba(128, 128, 128, 0.25)",
  "--wx-gantt-row-border": "rgba(128, 128, 128, 0.25)",
  "--wx-gantt-scale-border": "rgba(128, 128, 128, 0.25)",
  // Grid
  "--wx-grid-header-font": t.fontBrand,
  "--wx-grid-header-font-color": t.textSecondary,
  "--wx-grid-header-background": t.bgSubtle,
  "--wx-grid-body-font": t.fontBrand,
  "--wx-grid-body-font-color": t.textPrimary,
  "--wx-grid-body-background": t.bgBase,
  "--wx-grid-body-row-border": ganttGridBorder,
  "--wx-grid-cell-border": ganttGridBorder,
  // Timescale
  "--wx-timescale-font": t.fontBrand,
  "--wx-timescale-font-color": t.textSecondary,
  "--wx-timescale-border": ganttGridBorder,
  "--wx-timescale-background": t.bgSubtle,
  // Tooltip
  "--wx-tooltip-background": t.bgElevated,
  "--wx-tooltip-font-color": t.textPrimary,
  // Background/borders
  "--wx-background": t.bgBase,
  "--wx-background-alt": t.bgSubtle,
  "--wx-background-hover": t.bgSubtle,
  "--wx-border": border1Subtle,
  "--wx-color": t.textPrimary,
  "--wx-color-font": t.textPrimary,
  "--wx-color-font-alt": t.textSecondary,
  "--wx-color-font-disabled": t.neutralBase,
  "--wx-color-secondary": t.textSecondary,
  // Primary/secondary/danger colors
  "--wx-color-primary": t.accent,
  "--wx-color-primary-font": t.btnPrimaryText,
  "--wx-color-primary-selected": "rgba(239, 63, 50, 0.1)",
  "--wx-color-secondary-font": t.textPrimary,
  "--wx-color-secondary-border": t.borderStrong,
  "--wx-color-secondary-hover": t.bgSubtle,
  "--wx-color-danger": t.stateDanger,
  "--wx-button-danger-font-color": t.btnPrimaryText,
  "--wx-color-link": t.accent,
  "--wx-color-disabled": t.neutralLight,
  // Popup/Modal
  "--wx-popup-background": t.bgElevated,
  "--wx-popup-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  "--wx-popup-border": border1Subtle,
  "--wx-popup-border-radius": t.radiusLg,
  "--wx-popup-z-index": "1200",
  "--wx-modal-background": t.bgElevated,
  "--wx-modal-border": border1Subtle,
  "--wx-modal-border-radius": t.radiusLg,
  "--wx-modal-width": "360px",
  "--wx-modal-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  "--wx-box-shadow": "0 4px 12px rgba(0, 0, 0, 0.15)",
  "--wx-padding": t.spacingMd,
  // Input
  "--wx-input-width": "100%",
  "--wx-input-height": "44px",
  "--wx-input-padding": `${t.spacingSm} ${t.spacingMd}`,
  "--wx-input-background": t.bgBase,
  "--wx-input-background-disabled": t.bgSubtle,
  "--wx-input-border": border1Subtle,
  "--wx-input-border-focus": `2px solid ${t.accent}`,
  "--wx-input-border-disabled": border1Subtle,
  "--wx-input-border-radius": t.radiusMd,
  "--wx-input-font-family": t.fontBrand,
  "--wx-input-font-size": t.fontSm,
  "--wx-input-font-weight": "400",
  "--wx-input-font-color": t.textPrimary,
  "--wx-input-line-height": "1.5",
  "--wx-input-text-align": "left",
  "--wx-input-placeholder-color": t.neutralBase,
  "--wx-input-icon-size": "16px",
  "--wx-input-icon-indent": t.spacingSm,
  "--wx-input-icon-color": t.textSecondary,
  // Text/Textarea
  "--wx-text-font-color": t.textPrimary,
  "--wx-textarea-font-color": t.textPrimary,
  // Label
  "--wx-label-font-color": t.textSecondary,
  "--wx-field-label-color": t.textSecondary,
  // Button
  "--wx-button-background": t.btnPrimaryBg,
  "--wx-button-font-color": t.btnPrimaryText,
  "--wx-button-font-family": t.fontBrand,
  "--wx-button-font-size": t.fontSm,
  "--wx-button-font-weight": "500",
  "--wx-button-line-height": "1.5",
  "--wx-button-padding": `${t.spacingXs} ${t.spacingMd}`,
  "--wx-button-border": "none",
  "--wx-button-border-radius": t.radiusSm,
  "--wx-button-width": "auto",
  "--wx-button-icon-size": "14px",
  "--wx-button-icon-indent": t.spacingXs,
  "--wx-button-text-transform": "none",
  "--wx-button-pressed": t.btnPrimaryHover,
  "--wx-button-box-shadow": "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
  "--wx-button-primary-pressed": t.btnPrimaryHover,
  "--wx-button-primary-box-shadow": "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
  "--wx-button-danger-pressed": t.btnPrimaryHover,
  // Checkbox
  "--wx-checkbox-size": "18px",
  "--wx-checkbox-height": "24px",
  "--wx-checkbox-font-family": t.fontBrand,
  "--wx-checkbox-font-size": t.fontSm,
  "--wx-checkbox-font-weight": "400",
  "--wx-checkbox-font-color": t.textPrimary,
  "--wx-checkbox-line-height": "1.5",
  "--wx-checkbox-border-width": "1px",
  "--wx-checkbox-border-color": t.borderStrong,
  "--wx-checkbox-border-color-disabled": t.neutralLight,
  "--wx-checkbox-border-radius": t.radiusSm,
  // Slider/Progress
  "--wx-slider-track-height": "8px",
  "--wx-slider-track-background": t.neutralLight,
  "--wx-slider-thumb-size": "20px",
  "--wx-slider-thumb-background": t.accent,
  "--wx-slider-primary": t.accent,
  "--wx-slider-background": t.neutralLight,
  "--wx-progress-background": t.neutralLight,
  "--wx-progress-color": t.accent,
  "--wx-progress-height": "8px",
  "--wx-progress-border-radius": t.radiusSm,
  // Misc
  "--wx-field-gutter": t.spacingLg,
  "--wx-sidebar-close-icon": t.textSecondary,
  "--wx-font-family": t.fontBrand,
  "--wx-font-size": t.fontSm,
  "--wx-font-size-sm": t.fontXs,
  "--wx-font-weight": "400",
  "--wx-font-weight-md": "500",
  "--wx-line-height": "1.5",
  "--wx-line-height-sm": "1.4",
  "--wx-icon-size": "16px",
  "--wx-icon-color": t.textSecondary,
  "--wx-icon-border-radius": t.radiusSm,
  // Multicombo
  "--wx-multicombo-tag-gap": t.spacing2xs,
  "--wx-multicombo-tag-border": border1Subtle,
  "--wx-multicombo-tag-border-radius": t.radiusSm,
  "--wx-multicombo-tag-background": t.bgSubtle,
  "--wx-multicombo-tag-pading": `${t.spacing2xs} ${t.spacingXs}`,
  // Calendar
  "--wx-calendar-padding": t.spacingMd,
  "--wx-calendar-gap": t.spacingXs,
  "--wx-calendar-line-gap": "2px",
  "--wx-calendar-cell-size": "36px",
  "--wx-calendar-font-family": t.fontBrand,
  "--wx-calendar-font-size": t.fontSm,
  "--wx-calendar-font-weight": "400",
  "--wx-calendar-font-color": t.textPrimary,
  "--wx-calendar-line-height": "1.5",
  "--wx-calendar-border-radius": t.radiusSm,
  "--wx-calendar-header-font-size": t.fontMd,
  "--wx-calendar-header-font-weight": "500",
  "--wx-calendar-header-line-height": "1.5",
  "--wx-calendar-icon-size": "16px",
  "--wx-calendar-icon-color": t.textSecondary,
  "--wx-calendar-controls-font-family": t.fontBrand,
  "--wx-calendar-controls-font-size": t.fontSm,
  "--wx-calendar-controls-font-weight": "500",
  "--wx-calendar-controls-line-height": "1.5",
  "--wx-calendar-controls-font-color": t.accent
};
var faIconBase = {
  fontFamily: '"Font Awesome 7 Free" !important',
  fontWeight: "900 !important",
  fontStyle: "normal !important",
  fontSize: "12px"
};
var globalIconCss = `i[class*="wxi-"]{font-style:normal!important}
i.wxi-menu-down:before,i.wxi-angle-down:before{content:"\\f078"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:12px;font-style:normal!important}
i.wxi-menu-up:before,i.wxi-angle-up:before{content:"\\f077"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:12px;font-style:normal!important}
i.wxi-menu-left:before,i.wxi-angle-left:before{content:"\\f053"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:12px;font-style:normal!important}
i.wxi-menu-right:before,i.wxi-angle-right:before{content:"\\f054"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:12px;font-style:normal!important}
i.wxi-close:before{content:"\\f00d"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:14px;font-style:normal!important;transform:translate(0)!important}
i.wxi-plus:before{content:"\\2b"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:11px;font-style:normal!important}
i.wxi-minus:before{content:"\\f068"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:11px;font-style:normal!important}
i.wxi-check:before{content:"\\f00c"!important;font-family:"Font Awesome 7 Free"!important;font-weight:900!important;font-size:12px;font-style:normal!important}`;
var buttonBase = {
  borderRadius: "component.buttonRadius",
  fontFamily: "brand",
  fontSize: "sm",
  fontWeight: "medium",
  padding: "xs",
  paddingLeft: "md",
  paddingRight: "md",
  minHeight: "component.buttonMinHeight",
  cursor: "pointer",
  transition: "all 0.15s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  "&:active": { transform: "scale(0.98)" }
};
var GanttWrapper = styled("div", {
  base: {
    position: "relative",
    fontFamily: "brand",
    ...svarCssVariables,
    // SVAR Icon Overrides - font-style:normal prevents italic skewing on <i> elements
    '& i[class*="wxi-"]': { fontStyle: "normal !important" },
    "& i.wxi-menu-down::before, & i.wxi-angle-down::before": { content: '"\\f078" !important', ...faIconBase },
    "& i.wxi-menu-up::before, & i.wxi-angle-up::before": { content: '"\\f077" !important', ...faIconBase },
    "& i.wxi-menu-left::before, & i.wxi-angle-left::before": { content: '"\\f053" !important', ...faIconBase },
    "& i.wxi-menu-right::before, & i.wxi-angle-right::before": { content: '"\\f054" !important', ...faIconBase },
    "& i.wxi-close::before": { content: '"\\f00d" !important', ...faIconBase, fontSize: "14px" },
    "& i.wxi-plus::before": { content: '"\\2b" !important', ...faIconBase, fontSize: "11px" },
    "& i.wxi-minus::before": { content: '"\\f068" !important', ...faIconBase, fontSize: "11px" },
    "& i.wxi-check::before": { content: '"\\f00c" !important', ...faIconBase },
    // Editor panel overrides
    "& .wx-sidearea": {
      bg: "background.elevated",
      borderLeft: "1px solid",
      borderColor: "border.subtle",
      boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.08)"
    },
    '& [class*="wx-gantt-editor"]': { padding: "lg", fontFamily: "brand" },
    '& [class*="wx-gantt-editor"] > div:first-child': {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "sm",
      paddingBottom: "md",
      marginBottom: "lg",
      borderBottom: "1px solid",
      borderColor: "border.subtle"
    },
    '& [class*="wx-gantt-editor"] label, & .wx-sidearea label, & .wx-field label': {
      display: "block",
      color: `${t.textSecondary} !important`,
      fontSize: "xs",
      fontWeight: "medium",
      fontFamily: "brand",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "xs"
    },
    "& .wx-field": { color: t.textPrimary },
    '& [class*="wx-gantt-editor"] .wx-button.wx-danger, & [class*="wx-gantt-editor"] button[class*="danger"]': {
      padding: "4px 8px !important",
      fontSize: "12px !important",
      fontWeight: "500",
      minHeight: "unset !important",
      height: "auto !important",
      lineHeight: "1.4"
    },
    '& [class*="wx-gantt-editor"] .wx-icon': {
      order: 1,
      background: "transparent !important",
      backgroundColor: "transparent !important",
      border: "none !important",
      boxShadow: "none !important",
      width: "28px !important",
      height: "28px !important",
      minWidth: "unset !important",
      minHeight: "unset !important",
      padding: "0 !important",
      borderRadius: "sm",
      color: `${t.textSecondary} !important`,
      cursor: "pointer",
      transition: "all 0.15s ease",
      display: "flex !important",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": { color: `${t.textPrimary} !important`, background: `${t.bgSubtle} !important` }
    },
    '& [class*="wx-gantt-editor"] .wx-slider': { display: "flex", alignItems: "center", gap: "sm", width: "100%" },
    '& [class*="wx-gantt-editor"] .wx-slider input': {
      flex: 1,
      height: "6px",
      appearance: "none",
      WebkitAppearance: "none",
      background: t.neutralLight,
      borderRadius: "3px",
      cursor: "pointer",
      "&::-webkit-slider-thumb, &::-moz-range-thumb": {
        WebkitAppearance: "none",
        appearance: "none",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: t.accent,
        cursor: "pointer",
        border: "2px solid white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }
    },
    '& [class*="wx-gantt-editor"] .wx-slider .wx-label': { minWidth: "36px", textAlign: "right", fontSize: "xs", color: "text.secondary" },
    // Modal/popup styling
    "& .wx-modal, & .wx-popup": {
      bg: "background.elevated",
      borderRadius: "component.modalRadius",
      boxShadow: "component.modalShadow",
      border: "1px solid",
      borderColor: "border.subtle",
      fontFamily: "brand",
      fontSize: "sm",
      color: "text.primary",
      padding: "lg",
      minWidth: "320px"
    },
    "& .wx-modal-header, & .wx-popup-header": {
      borderBottom: "1px solid",
      borderColor: "border.subtle",
      fontWeight: "bold",
      fontSize: "lg",
      color: "text.primary",
      paddingBottom: "md",
      marginBottom: "md"
    },
    "& .wx-modal-footer, & .wx-popup-footer": {
      borderTop: "1px solid",
      borderColor: "border.subtle",
      paddingTop: "md",
      marginTop: "md",
      display: "flex",
      justifyContent: "flex-end",
      gap: "sm"
    },
    // Button variants
    '& [class*="wx-button"][class*="wx-primary"]': {
      ...buttonBase,
      bg: "button.primary.bg",
      color: "button.primary.text",
      border: "none",
      "&:hover": { bg: "button.primary.bgHover" },
      "&:focus": { boxShadow: "focus.button", outline: "none" }
    },
    '& [class*="wx-button"][class*="wx-secondary"]': {
      ...buttonBase,
      bg: "button.dark.bg",
      color: "button.dark.text",
      border: "none",
      "&:hover": { bg: "button.dark.bgHover" },
      "&:focus": { boxShadow: "focus.button", outline: "none" }
    },
    '& [class*="wx-button"][class*="wx-danger"]': {
      ...buttonBase,
      bg: "button.primary.bg",
      color: "button.primary.text",
      border: "none",
      "&:hover": { bg: "button.primary.bgHover" },
      "&:focus": { boxShadow: "focus.danger", outline: "none" }
    },
    "& .wx-close, & .wx-modal-close": {
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
      padding: 0,
      transition: "all 0.15s ease",
      "&:hover": {
        bg: "background.subtle",
        color: "text.primary"
      },
      "&:focus": {
        boxShadow: "focus.dialog",
        outline: "none"
      }
    },
    '& .wx-checkbox, & input[type="checkbox"]': {
      width: "18px",
      height: "18px",
      borderRadius: "sm",
      border: "1px solid",
      borderColor: "border.strong",
      cursor: "pointer",
      accentColor: t.accent
    },
    "& .wx-datepicker, & .wx-calendar": {
      bg: "background.elevated",
      border: "1px solid",
      borderColor: "border.subtle",
      borderRadius: "component.popoverRadius",
      boxShadow: "none",
      fontFamily: "brand",
      fontSize: "sm"
    },
    '& [class*="wx-slider"]': { accentColor: t.accent, cursor: "pointer" },
    "& .wx-tabs": {
      borderBottom: "1px solid",
      borderColor: "border.subtle",
      marginBottom: "md"
    },
    "& .wx-tab": {
      fontFamily: "brand",
      fontSize: "sm",
      fontWeight: "medium",
      color: "text.secondary",
      padding: "sm",
      cursor: "pointer",
      borderBottom: "2px solid transparent",
      transition: "all 0.15s ease",
      "&:hover": {
        color: "text.primary",
        bg: "background.subtle"
      },
      '&.active, &[aria-selected="true"]': {
        color: "accent.primary",
        borderBottomColor: "accent.primary"
      }
    }
  }
});
var GanttContainer = styled("div", {
  base: {
    width: "100%",
    borderRadius: "component.cardRadius",
    border: "1px solid",
    borderColor: "border.subtle",
    overflow: "hidden",
    bg: "background.base",
    "& .wx-gantt": { border: "none" },
    "& .wx-header": { bg: "background.subtle", borderBottom: "1px solid", borderColor: "border.subtle" },
    "& .wx-grid-header": { fontWeight: "medium", fontSize: "xs", textTransform: "uppercase", letterSpacing: "0.5px" },
    "& .wx-grid-cell, & .wx-timescale-cell": { fontSize: "xs", color: "text.primary" },
    "& .wx-timescale-cell": { fontWeight: "medium" },
    "& .wx-grid-body": { bg: "background.base", color: "text.primary" },
    "& .wx-grid-body .wx-row, & .wx-grid .wx-row, & .wx-area .wx-row": { borderBottom: "1px solid rgba(128, 128, 128, 0.25)" },
    "& .wx-grid-body .wx-cell, & .wx-grid .wx-cell": { borderRight: "1px solid rgba(128, 128, 128, 0.25)", color: "text.primary" },
    "& .wx-bar": { transition: "all 0.15s ease", "&:hover": { opacity: 0.9 } },
    "& .wx-bar-content": { fontSize: "xs", fontWeight: "medium" },
    "& .wx-link": { stroke: t.borderStrong },
    "& .wx-grid": { borderRight: "1px solid", borderColor: "border.subtle" },
    "& .wx-scale-row, & .wx-row-lines, & .wx-cell-lines, & .wx-chart line, & .wx-area line": { stroke: "rgba(128, 128, 128, 0.25)" },
    "& .wx-resizer": { cursor: "col-resize", bg: "background.subtle", transition: "background 0.15s ease", "&:hover": { bg: "border.strong" }, "&:active": { bg: "accent.primary" } }
  }
});
function GanttChartComponent({
  tasks,
  links = [],
  scales,
  columns,
  start,
  end,
  height = 400,
  editable = false,
  readonly = false,
  showTooltip = true,
  showEditor,
  onTaskClick,
  onTaskChange,
  onLinkAdd,
  onLinkDelete
}, ref) {
  const shouldShowEditor = showEditor ?? editable;
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState2(false);
  const [canScrollRight, setCanScrollRight] = useState2(false);
  const [api, setApi] = useState2(null);
  useEffect2(() => {
    if (typeof document === "undefined") return;
    const styleId = "svar-gantt-icons";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = globalIconCss;
      document.head.appendChild(style);
    }
  }, []);
  const getScrollableElement = useCallback2(() => {
    const container = containerRef.current;
    if (!container) return null;
    const isScrollable = (el) => el && el.scrollWidth > el.clientWidth;
    const area = container.querySelector(".wx-area");
    if (isScrollable(area)) return area;
    const chart = container.querySelector(".wx-chart");
    const overflow = chart?.querySelector('[style*="overflow"]');
    return isScrollable(overflow) ? overflow : chart;
  }, []);
  const updateScrollState = useCallback2(() => {
    const el = getScrollableElement();
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, [getScrollableElement]);
  useEffect2(() => {
    if (!containerRef.current) return;
    let el = null;
    let resizeObserver = null;
    const timeoutId = setTimeout(() => {
      el = getScrollableElement();
      if (!el) return;
      updateScrollState();
      el.addEventListener("scroll", updateScrollState);
      resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      el?.removeEventListener("scroll", updateScrollState);
      resizeObserver?.disconnect();
    };
  }, [updateScrollState, getScrollableElement]);
  const scroll = (dir) => {
    const el = getScrollableElement();
    el?.scrollBy({ left: (dir === "left" ? -1 : 1) * el.clientWidth * 0.5, behavior: "smooth" });
  };
  const ganttProps = {
    tasks,
    links,
    readonly: readonly || !editable,
    taskTemplate: TaskTemplate,
    init: setApi,
    columns: columns === false ? [] : columns ?? defaultColumns,
    ...scales && { scales },
    ...start && { start },
    ...end && { end },
    ...onTaskClick && { "select-task": (t2) => {
      const f = tasks.find((x) => x.id === t2.id);
      if (f) onTaskClick(f);
    } },
    ...onTaskChange && { "update-task": onTaskChange },
    ...onLinkAdd && { "add-link": onLinkAdd },
    ...onLinkDelete && { "delete-link": onLinkDelete }
  };
  const ganttElement = /* @__PURE__ */ jsx32(Gantt, { ...ganttProps });
  const ganttWithTooltip = showTooltip && api ? /* @__PURE__ */ jsx32(Tooltip2, { api, children: ganttElement }) : ganttElement;
  return /* @__PURE__ */ jsxs18(GanttWrapper, { ref, children: [
    /* @__PURE__ */ jsxs18(GanttContainer, { style: { height, position: "relative" }, children: [
      /* @__PURE__ */ jsx32("div", { ref: containerRef, style: { height: "100%" }, children: ganttWithTooltip }),
      /* @__PURE__ */ jsx32("div", { className: scrollNavStyles, children: ["left", "right"].map((dir) => /* @__PURE__ */ jsx32(
        "button",
        {
          type: "button",
          className: scrollButtonStyles,
          onClick: () => scroll(dir),
          disabled: dir === "left" ? !canScrollLeft : !canScrollRight,
          "aria-label": `Scroll timeline ${dir}`,
          children: /* @__PURE__ */ jsx32(ChevronIcon2, { direction: dir })
        },
        dir
      )) })
    ] }),
    shouldShowEditor && api && /* @__PURE__ */ jsx32(Editor, { api })
  ] });
}
GanttChartComponent.displayName = "GanttChart";
var GanttChart = forwardRef31(GanttChartComponent);

// src/charts/BarChart.tsx
import { Bar } from "react-chartjs-2";

// src/charts/ChartContainer.tsx
var ChartContainer = styled("div", {
  base: {
    width: "100%",
    position: "relative",
    fontFamily: "brand"
  }
});
var ChartInner = styled("div", {
  base: {
    position: "relative",
    width: "100%"
  }
});

// src/charts/chart-config.ts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title as Title7,
  Tooltip as Tooltip3,
  Legend,
  Filler
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title7,
  Tooltip3,
  Legend,
  Filler
);
var chartColors = {
  blue: token("colors.data.blue"),
  purple: token("colors.data.purple"),
  yellow: token("colors.data.yellow"),
  pink: token("colors.data.pink"),
  orange: token("colors.data.orange")
};
var chartColorPalette = [
  chartColors.blue,
  chartColors.purple,
  chartColors.yellow,
  chartColors.pink,
  chartColors.orange
];
function getChartColor(index) {
  return chartColorPalette[index % chartColorPalette.length];
}
var chartTypography = {
  fontFamily: token("fonts.brand"),
  fontSize: {
    title: 16,
    label: 12,
    tick: 11
  },
  fontWeight: {
    normal: "normal",
    medium: 500,
    bold: "bold"
  }
};
function createBaseChartOptions(colors, options) {
  const { title, showLegend = true, legendPosition = "top" } = options ?? {};
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: title ? {
        display: true,
        text: title,
        font: {
          family: chartTypography.fontFamily,
          size: chartTypography.fontSize.title,
          weight: chartTypography.fontWeight.medium
        },
        color: colors.textPrimary,
        padding: { bottom: 16 }
      } : { display: false },
      legend: {
        display: showLegend,
        position: legendPosition,
        labels: {
          font: {
            family: chartTypography.fontFamily,
            size: chartTypography.fontSize.label
          },
          color: colors.textSecondary,
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle"
        }
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleFont: {
          family: chartTypography.fontFamily,
          size: chartTypography.fontSize.label,
          weight: chartTypography.fontWeight.medium
        },
        bodyFont: {
          family: chartTypography.fontFamily,
          size: chartTypography.fontSize.label
        },
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4
      }
    }
  };
}
function createAxisOptions(colors) {
  return {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: chartTypography.fontFamily,
          size: chartTypography.fontSize.tick
        },
        color: colors.textSecondary
      },
      border: {
        color: colors.gridLine
      }
    },
    y: {
      grid: {
        color: colors.gridLine
      },
      ticks: {
        font: {
          family: chartTypography.fontFamily,
          size: chartTypography.fontSize.tick
        },
        color: colors.textSecondary
      },
      border: {
        display: false
      }
    }
  };
}

// src/charts/use-chart-ui-colors.ts
import { useContext } from "react";

// src/theme/ThemeProvider.tsx
import {
  createContext,
  useCallback as useCallback3,
  useEffect as useEffect3,
  useState as useState3
} from "react";
import { jsx as jsx33 } from "react/jsx-runtime";
var ThemeContext = createContext(null);
var STORAGE_KEY = "waterworth-color-mode";
function getSystemPreference() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function getStoredColorMode() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
  }
  return null;
}
var ThemeProvider = ({
  children,
  defaultColorMode = "system"
}) => {
  const [colorMode, setColorModeState] = useState3(() => {
    return getStoredColorMode() ?? defaultColorMode;
  });
  const [systemPreference, setSystemPreference] = useState3(
    getSystemPreference
  );
  const resolvedColorMode = colorMode === "system" ? systemPreference : colorMode;
  const setColorMode = useCallback3((mode) => {
    setColorModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
    }
  }, []);
  const toggleColorMode = useCallback3(() => {
    const newMode = resolvedColorMode === "dark" ? "light" : "dark";
    setColorMode(newMode);
  }, [resolvedColorMode, setColorMode]);
  useEffect3(() => {
    if (colorMode !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorMode]);
  useEffect3(() => {
    document.documentElement.setAttribute("data-color-mode", resolvedColorMode);
  }, [resolvedColorMode]);
  return /* @__PURE__ */ jsx33(
    ThemeContext.Provider,
    {
      value: { colorMode, resolvedColorMode, setColorMode, toggleColorMode },
      children
    }
  );
};
ThemeProvider.displayName = "ThemeProvider";

// src/charts/use-chart-ui-colors.ts
var lightColors = {
  textPrimary: token("colors.brand.dark"),
  textSecondary: token("colors.text.subtle"),
  gridLine: token("colors.text.muted"),
  background: token("colors.bg.base"),
  tooltipBg: token("colors.brand.dark"),
  tooltipText: token("colors.text.on-dark")
};
var darkColors = {
  textPrimary: token("colors.dark-text.main"),
  textSecondary: token("colors.dark-text.subtle"),
  gridLine: token("colors.dark-border.subtle"),
  background: token("colors.dark-bg.base"),
  tooltipBg: token("colors.dark-text.main"),
  tooltipText: token("colors.dark-bg.base")
};
function useChartUIColors() {
  const context2 = useContext(ThemeContext);
  const resolvedColorMode = context2?.resolvedColorMode ?? "light";
  return resolvedColorMode === "dark" ? darkColors : lightColors;
}

// src/charts/use-chart-colors.ts
import { useContext as useContext2, useMemo as useMemo3 } from "react";
function useChartColors(count, customColors) {
  return useMemo3(() => {
    if (customColors && customColors.length > 0) {
      if (customColors.length >= count) {
        return customColors.slice(0, count);
      }
      const extended = [];
      for (let i = 0; i < count; i++) {
        extended.push(customColors[i % customColors.length]);
      }
      return extended;
    }
    return Array.from({ length: count }, (_, i) => getChartColor(i));
  }, [count, customColors]);
}
function useChartColorPalette() {
  return chartColorPalette;
}
var lightDataPalette = [
  token("colors.data.blue"),
  token("colors.data.purple"),
  token("colors.data.yellow"),
  token("colors.data.pink"),
  token("colors.data.orange")
];
var darkDataPalette = [
  token("colors.data.blue-dark"),
  token("colors.data.purple-dark"),
  token("colors.data.yellow-dark"),
  token("colors.data.pink-dark"),
  token("colors.data.orange-dark")
];
var bgDataPalette = [
  token("colors.data.blue-bg"),
  token("colors.data.purple-bg"),
  token("colors.data.yellow-bg"),
  token("colors.data.pink-bg"),
  token("colors.data.orange-bg")
];
function useChartDataColors() {
  const context2 = useContext2(ThemeContext);
  const resolvedColorMode = context2?.resolvedColorMode ?? "light";
  return {
    palette: resolvedColorMode === "dark" ? darkDataPalette : lightDataPalette,
    bgPalette: bgDataPalette
  };
}

// src/charts/BarChart.tsx
import { jsx as jsx34 } from "react/jsx-runtime";
function BarChart({
  labels,
  datasets,
  title,
  showLegend = true,
  legendPosition = "top",
  height = 300,
  className,
  showValues = false,
  horizontal = false
}) {
  const uiColors = useChartUIColors();
  const { palette } = useChartDataColors();
  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor ?? palette[index % palette.length],
      borderColor: dataset.borderColor ?? "transparent",
      borderWidth: dataset.borderWidth ?? 0,
      borderRadius: 4
    }))
  };
  const baseOptions = createBaseChartOptions(uiColors, { title, showLegend, legendPosition });
  const axisOptions = createAxisOptions(uiColors);
  const options = {
    ...baseOptions,
    indexAxis: horizontal ? "y" : "x",
    scales: horizontal ? { x: axisOptions.y, y: axisOptions.x } : axisOptions,
    plugins: {
      ...baseOptions.plugins,
      ...showValues && {
        datalabels: {
          display: true,
          anchor: "end",
          align: "top"
        }
      }
    }
  };
  return /* @__PURE__ */ jsx34(ChartContainer, { className, children: /* @__PURE__ */ jsx34(ChartInner, { style: { height }, children: /* @__PURE__ */ jsx34(Bar, { data: chartData, options }) }) });
}

// src/charts/LineChart.tsx
import { Line } from "react-chartjs-2";
import { jsx as jsx35 } from "react/jsx-runtime";
function LineChart({
  labels,
  datasets,
  title,
  showLegend = true,
  legendPosition = "top",
  height = 300,
  className,
  tension = 0.4
}) {
  const uiColors = useChartUIColors();
  const { palette, bgPalette } = useChartDataColors();
  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => {
      const color = dataset.borderColor ?? palette[index % palette.length];
      return {
        label: dataset.label,
        data: dataset.data,
        borderColor: color,
        backgroundColor: dataset.fill ? dataset.backgroundColor ?? bgPalette[index % bgPalette.length] : "transparent",
        borderWidth: 2,
        fill: dataset.fill ?? false,
        tension: dataset.tension ?? tension,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointBorderWidth: 2
      };
    })
  };
  const baseOptions = createBaseChartOptions(uiColors, { title, showLegend, legendPosition });
  const axisOptions = createAxisOptions(uiColors);
  const options = {
    ...baseOptions,
    scales: axisOptions,
    interaction: {
      mode: "index",
      intersect: false
    },
    hover: {
      mode: "index",
      intersect: false
    }
  };
  return /* @__PURE__ */ jsx35(ChartContainer, { className, children: /* @__PURE__ */ jsx35(ChartInner, { style: { height }, children: /* @__PURE__ */ jsx35(Line, { data: chartData, options }) }) });
}

// src/charts/PieChart.tsx
import { Pie } from "react-chartjs-2";
import { jsx as jsx36 } from "react/jsx-runtime";
function PieChart({
  labels,
  data,
  title,
  showLegend = true,
  legendPosition = "top",
  height = 300,
  className,
  colors
}) {
  const uiColors = useChartUIColors();
  const { palette } = useChartDataColors();
  const segmentColors = colors ?? labels.map((_, index) => palette[index % palette.length]);
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: segmentColors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };
  const baseOptions = createBaseChartOptions(uiColors, { title, showLegend, legendPosition });
  const options = {
    ...baseOptions
  };
  return /* @__PURE__ */ jsx36(ChartContainer, { className, children: /* @__PURE__ */ jsx36(ChartInner, { style: { height }, children: /* @__PURE__ */ jsx36(Pie, { data: chartData, options }) }) });
}

// src/charts/DoughnutChart.tsx
import { Doughnut } from "react-chartjs-2";
import { jsx as jsx37 } from "react/jsx-runtime";
function DoughnutChart({
  labels,
  data,
  title,
  showLegend = true,
  legendPosition = "top",
  height = 300,
  className,
  colors,
  cutout = "50%"
}) {
  const uiColors = useChartUIColors();
  const { palette } = useChartDataColors();
  const segmentColors = colors ?? labels.map((_, index) => palette[index % palette.length]);
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: segmentColors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };
  const baseOptions = createBaseChartOptions(uiColors, { title, showLegend, legendPosition });
  const options = {
    ...baseOptions,
    cutout
  };
  return /* @__PURE__ */ jsx37(ChartContainer, { className, children: /* @__PURE__ */ jsx37(ChartInner, { style: { height }, children: /* @__PURE__ */ jsx37(Doughnut, { data: chartData, options }) }) });
}

// src/theme/useColorMode.ts
import { useContext as useContext3 } from "react";
function useColorMode() {
  const context2 = useContext3(ThemeContext);
  if (!context2) {
    throw new Error("useColorMode must be used within a ThemeProvider");
  }
  return context2;
}

// src/theme/ThemeToggle.tsx
import { jsx as jsx38 } from "react/jsx-runtime";
var ToggleButton = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "sm",
    border: "1px solid",
    borderColor: "border.subtle",
    bg: "background.base",
    color: "text.primary",
    cursor: "pointer",
    transition: "all 0.15s ease",
    _hover: {
      bg: "background.subtle",
      borderColor: "border.strong"
    },
    _focus: {
      outline: "none",
      boxShadow: "focus.primary"
    },
    _active: {
      transform: "scale(0.95)"
    }
  }
});
var cycleOrder = ["light", "dark", "system"];
var ThemeToggle = ({ mode = "simple", className }) => {
  const { colorMode, resolvedColorMode, setColorMode } = useColorMode();
  const handleClick = () => {
    if (mode === "simple") {
      setColorMode(resolvedColorMode === "light" ? "dark" : "light");
    } else {
      const currentIndex = cycleOrder.indexOf(colorMode);
      const nextIndex = (currentIndex + 1) % cycleOrder.length;
      setColorMode(cycleOrder[nextIndex]);
    }
  };
  const getAriaLabel = () => {
    if (mode === "simple") {
      return resolvedColorMode === "light" ? "Switch to dark mode" : "Switch to light mode";
    }
    const nextIndex = (cycleOrder.indexOf(colorMode) + 1) % cycleOrder.length;
    const nextMode = cycleOrder[nextIndex];
    return `Current: ${colorMode}. Switch to ${nextMode} mode`;
  };
  return /* @__PURE__ */ jsx38(
    ToggleButton,
    {
      type: "button",
      onClick: handleClick,
      "aria-label": getAriaLabel(),
      className,
      children: /* @__PURE__ */ jsx38(
        Icon,
        {
          name: resolvedColorMode === "light" ? "sun" : "moon",
          size: "md"
        }
      )
    }
  );
};
ThemeToggle.displayName = "ThemeToggle";
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Badge,
  BarChart,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  Checkbox,
  Dialog,
  DoughnutChart,
  DropdownMenu,
  EventCalendar,
  FormContainer,
  FormHelperText,
  FormItemContainer,
  FormLabel,
  GanttChart,
  Grid,
  GridItem,
  Icon,
  Input,
  LineChart,
  Pagination,
  PaginationButton,
  PaginationEllipsis,
  PieChart,
  Popover,
  Progress,
  RadioGroup,
  Search,
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
  ThemeContext,
  ThemeProvider,
  ThemeToggle,
  Toast,
  ToastProvider,
  Tooltip,
  chartColorPalette,
  chartColors,
  getChartColor,
  useChartColorPalette,
  useChartColors,
  useChartDataColors,
  useColorMode
};
