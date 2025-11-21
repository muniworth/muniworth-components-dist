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
var lengthUnits = "cm,mm,Q,in,pc,pt,px,em,ex,ch,rem,lh,rlh,vw,vh,vmin,vmax,vb,vi,svw,svh,lvw,lvh,dvw,dvh,cqw,cqh,cqi,cqb,cqmin,cqmax,%";
var lengthUnitsPattern = `(?:${lengthUnits.split(",").join("|")})`;
var lengthRegExp = new RegExp(`^[+-]?[0-9]*.?[0-9]+(?:[eE][+-]?[0-9]+)?${lengthUnitsPattern}$`);
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
          /* @__PURE__ */ jsx13(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx13(Content6, { ref, sideOffset: 4, children: items.map((item) => /* @__PURE__ */ jsx13(
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

// src/table/Table.tsx
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { forwardRef as forwardRef21, useEffect, useState } from "react";
import { jsx as jsx20, jsxs as jsxs13 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx20(TableContainer, { ref, children: /* @__PURE__ */ jsxs13(StyledTable, { children: [
    /* @__PURE__ */ jsx20(TableHead, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx20("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx20(
      TableHeaderCell,
      {
        onClick: header.column.getToggleSortingHandler(),
        sortable: header.column.getCanSort(),
        children: header.isPlaceholder ? null : /* @__PURE__ */ jsxs13(HeaderCellContent, { children: [
          flexRender(
            header.column.columnDef.header,
            header.getContext()
          ),
          header.column.getIsSorted() && /* @__PURE__ */ jsx20("span", { children: header.column.getIsSorted() === "asc" ? "\u2191" : "\u2193" })
        ] })
      },
      header.id
    )) }, headerGroup.id)) }),
    /* @__PURE__ */ jsx20(TableBody, { children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx20(
      TableRow,
      {
        "data-selected": row.getIsSelected(),
        children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx20(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
      },
      row.id
    )) })
  ] }) });
}
TableComponent.displayName = "Table";
var Table = forwardRef21(TableComponent);
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Badge,
  Button,
  Card,
  CardActions,
  Checkbox,
  Dialog,
  DropdownMenu,
  FormContainer,
  FormHelperText,
  FormItemContainer,
  FormLabel,
  Input,
  Popover,
  Progress,
  RadioGroup,
  Select,
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
