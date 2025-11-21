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
  ({ value, max: max2 = 100, indeterminate, "aria-label": ariaLabel }, ref) => {
    const safeValue = Math.min(Math.max(value ?? 0, 0), max2);
    const percentage = safeValue / max2 * 100;
    const progressValue = indeterminate ? void 0 : safeValue;
    return /* @__PURE__ */ jsx16(
      Root13,
      {
        ref,
        value: progressValue,
        max: max2,
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

// ../../node_modules/@tanstack/react-table/build/lib/index.mjs
import * as React from "react";

// ../../node_modules/@tanstack/table-core/build/lib/index.mjs
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function makeStateUpdater(key, instance) {
  return (updater) => {
    instance.setState((old) => {
      return {
        ...old,
        [key]: functionalUpdate(updater, old[key])
      };
    });
  };
}
function isFunction(d) {
  return d instanceof Function;
}
function isNumberArray(d) {
  return Array.isArray(d) && d.every((val) => typeof val === "number");
}
function flattenBy(arr, getChildren) {
  const flat = [];
  const recurse = (subArr) => {
    subArr.forEach((item) => {
      flat.push(item);
      const children = getChildren(item);
      if (children != null && children.length) {
        recurse(children);
      }
    });
  };
  recurse(arr);
  return flat;
}
function memo2(getDeps, fn, opts) {
  let deps = [];
  let result;
  return (depArgs) => {
    let depTime;
    if (opts.key && opts.debug) depTime = Date.now();
    const newDeps = getDeps(depArgs);
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && opts.debug) resultTime = Date.now();
    result = fn(...newDeps);
    opts == null || opts.onChange == null || opts.onChange(result);
    if (opts.key && opts.debug) {
      if (opts != null && opts.debug()) {
        const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
        const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
        const resultFpsPercentage = resultEndTime / 16;
        const pad = (str, num) => {
          str = String(str);
          while (str.length < num) {
            str = " " + str;
          }
          return str;
        };
        console.info(`%c\u23F1 ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120))}deg 100% 31%);`, opts == null ? void 0 : opts.key);
      }
    }
    return result;
  };
}
function getMemoOptions(tableOptions, debugLevel, key, onChange) {
  return {
    debug: () => {
      var _tableOptions$debugAl;
      return (_tableOptions$debugAl = tableOptions == null ? void 0 : tableOptions.debugAll) != null ? _tableOptions$debugAl : tableOptions[debugLevel];
    },
    key: process.env.NODE_ENV === "development" && key,
    onChange
  };
}
function createCell(table, row, column, columnId) {
  const getRenderValue = () => {
    var _cell$getValue;
    return (_cell$getValue = cell.getValue()) != null ? _cell$getValue : table.options.renderFallbackValue;
  };
  const cell = {
    id: `${row.id}_${column.id}`,
    row,
    column,
    getValue: () => row.getValue(columnId),
    renderValue: getRenderValue,
    getContext: memo2(() => [table, column, row, cell], (table2, column2, row2, cell2) => ({
      table: table2,
      column: column2,
      row: row2,
      cell: cell2,
      getValue: cell2.getValue,
      renderValue: cell2.renderValue
    }), getMemoOptions(table.options, "debugCells", "cell.getContext"))
  };
  table._features.forEach((feature) => {
    feature.createCell == null || feature.createCell(cell, column, row, table);
  }, {});
  return cell;
}
function createColumn(table, columnDef, depth, parent) {
  var _ref, _resolvedColumnDef$id;
  const defaultColumn = table._getDefaultColumnDef();
  const resolvedColumnDef = {
    ...defaultColumn,
    ...columnDef
  };
  const accessorKey = resolvedColumnDef.accessorKey;
  let id = (_ref = (_resolvedColumnDef$id = resolvedColumnDef.id) != null ? _resolvedColumnDef$id : accessorKey ? typeof String.prototype.replaceAll === "function" ? accessorKey.replaceAll(".", "_") : accessorKey.replace(/\./g, "_") : void 0) != null ? _ref : typeof resolvedColumnDef.header === "string" ? resolvedColumnDef.header : void 0;
  let accessorFn;
  if (resolvedColumnDef.accessorFn) {
    accessorFn = resolvedColumnDef.accessorFn;
  } else if (accessorKey) {
    if (accessorKey.includes(".")) {
      accessorFn = (originalRow) => {
        let result = originalRow;
        for (const key of accessorKey.split(".")) {
          var _result;
          result = (_result = result) == null ? void 0 : _result[key];
          if (process.env.NODE_ENV !== "production" && result === void 0) {
            console.warn(`"${key}" in deeply nested key "${accessorKey}" returned undefined.`);
          }
        }
        return result;
      };
    } else {
      accessorFn = (originalRow) => originalRow[resolvedColumnDef.accessorKey];
    }
  }
  if (!id) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(resolvedColumnDef.accessorFn ? `Columns require an id when using an accessorFn` : `Columns require an id when using a non-string header`);
    }
    throw new Error();
  }
  let column = {
    id: `${String(id)}`,
    accessorFn,
    parent,
    depth,
    columnDef: resolvedColumnDef,
    columns: [],
    getFlatColumns: memo2(() => [true], () => {
      var _column$columns;
      return [column, ...(_column$columns = column.columns) == null ? void 0 : _column$columns.flatMap((d) => d.getFlatColumns())];
    }, getMemoOptions(table.options, "debugColumns", "column.getFlatColumns")),
    getLeafColumns: memo2(() => [table._getOrderColumnsFn()], (orderColumns2) => {
      var _column$columns2;
      if ((_column$columns2 = column.columns) != null && _column$columns2.length) {
        let leafColumns = column.columns.flatMap((column2) => column2.getLeafColumns());
        return orderColumns2(leafColumns);
      }
      return [column];
    }, getMemoOptions(table.options, "debugColumns", "column.getLeafColumns"))
  };
  for (const feature of table._features) {
    feature.createColumn == null || feature.createColumn(column, table);
  }
  return column;
}
var debug = "debugHeaders";
function createHeader(table, column, options) {
  var _options$id;
  const id = (_options$id = options.id) != null ? _options$id : column.id;
  let header = {
    id,
    column,
    index: options.index,
    isPlaceholder: !!options.isPlaceholder,
    placeholderId: options.placeholderId,
    depth: options.depth,
    subHeaders: [],
    colSpan: 0,
    rowSpan: 0,
    headerGroup: null,
    getLeafHeaders: () => {
      const leafHeaders = [];
      const recurseHeader = (h) => {
        if (h.subHeaders && h.subHeaders.length) {
          h.subHeaders.map(recurseHeader);
        }
        leafHeaders.push(h);
      };
      recurseHeader(header);
      return leafHeaders;
    },
    getContext: () => ({
      table,
      header,
      column
    })
  };
  table._features.forEach((feature) => {
    feature.createHeader == null || feature.createHeader(header, table);
  });
  return header;
}
var Headers = {
  createTable: (table) => {
    table.getHeaderGroups = memo2(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      var _left$map$filter, _right$map$filter;
      const leftColumns = (_left$map$filter = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter : [];
      const rightColumns = (_right$map$filter = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter : [];
      const centerColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      const headerGroups = buildHeaderGroups(allColumns, [...leftColumns, ...centerColumns, ...rightColumns], table);
      return headerGroups;
    }, getMemoOptions(table.options, debug, "getHeaderGroups"));
    table.getCenterHeaderGroups = memo2(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, leafColumns, left, right) => {
      leafColumns = leafColumns.filter((column) => !(left != null && left.includes(column.id)) && !(right != null && right.includes(column.id)));
      return buildHeaderGroups(allColumns, leafColumns, table, "center");
    }, getMemoOptions(table.options, debug, "getCenterHeaderGroups"));
    table.getLeftHeaderGroups = memo2(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.left], (allColumns, leafColumns, left) => {
      var _left$map$filter2;
      const orderedLeafColumns = (_left$map$filter2 = left == null ? void 0 : left.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _left$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, "left");
    }, getMemoOptions(table.options, debug, "getLeftHeaderGroups"));
    table.getRightHeaderGroups = memo2(() => [table.getAllColumns(), table.getVisibleLeafColumns(), table.getState().columnPinning.right], (allColumns, leafColumns, right) => {
      var _right$map$filter2;
      const orderedLeafColumns = (_right$map$filter2 = right == null ? void 0 : right.map((columnId) => leafColumns.find((d) => d.id === columnId)).filter(Boolean)) != null ? _right$map$filter2 : [];
      return buildHeaderGroups(allColumns, orderedLeafColumns, table, "right");
    }, getMemoOptions(table.options, debug, "getRightHeaderGroups"));
    table.getFooterGroups = memo2(() => [table.getHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getFooterGroups"));
    table.getLeftFooterGroups = memo2(() => [table.getLeftHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getLeftFooterGroups"));
    table.getCenterFooterGroups = memo2(() => [table.getCenterHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getCenterFooterGroups"));
    table.getRightFooterGroups = memo2(() => [table.getRightHeaderGroups()], (headerGroups) => {
      return [...headerGroups].reverse();
    }, getMemoOptions(table.options, debug, "getRightFooterGroups"));
    table.getFlatHeaders = memo2(() => [table.getHeaderGroups()], (headerGroups) => {
      return headerGroups.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getFlatHeaders"));
    table.getLeftFlatHeaders = memo2(() => [table.getLeftHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getLeftFlatHeaders"));
    table.getCenterFlatHeaders = memo2(() => [table.getCenterHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getCenterFlatHeaders"));
    table.getRightFlatHeaders = memo2(() => [table.getRightHeaderGroups()], (left) => {
      return left.map((headerGroup) => {
        return headerGroup.headers;
      }).flat();
    }, getMemoOptions(table.options, debug, "getRightFlatHeaders"));
    table.getCenterLeafHeaders = memo2(() => [table.getCenterFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders;
        return !((_header$subHeaders = header.subHeaders) != null && _header$subHeaders.length);
      });
    }, getMemoOptions(table.options, debug, "getCenterLeafHeaders"));
    table.getLeftLeafHeaders = memo2(() => [table.getLeftFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders2;
        return !((_header$subHeaders2 = header.subHeaders) != null && _header$subHeaders2.length);
      });
    }, getMemoOptions(table.options, debug, "getLeftLeafHeaders"));
    table.getRightLeafHeaders = memo2(() => [table.getRightFlatHeaders()], (flatHeaders) => {
      return flatHeaders.filter((header) => {
        var _header$subHeaders3;
        return !((_header$subHeaders3 = header.subHeaders) != null && _header$subHeaders3.length);
      });
    }, getMemoOptions(table.options, debug, "getRightLeafHeaders"));
    table.getLeafHeaders = memo2(() => [table.getLeftHeaderGroups(), table.getCenterHeaderGroups(), table.getRightHeaderGroups()], (left, center, right) => {
      var _left$0$headers, _left$, _center$0$headers, _center$, _right$0$headers, _right$;
      return [...(_left$0$headers = (_left$ = left[0]) == null ? void 0 : _left$.headers) != null ? _left$0$headers : [], ...(_center$0$headers = (_center$ = center[0]) == null ? void 0 : _center$.headers) != null ? _center$0$headers : [], ...(_right$0$headers = (_right$ = right[0]) == null ? void 0 : _right$.headers) != null ? _right$0$headers : []].map((header) => {
        return header.getLeafHeaders();
      }).flat();
    }, getMemoOptions(table.options, debug, "getLeafHeaders"));
  }
};
function buildHeaderGroups(allColumns, columnsToGroup, table, headerFamily) {
  var _headerGroups$0$heade, _headerGroups$;
  let maxDepth = 0;
  const findMaxDepth = function(columns, depth) {
    if (depth === void 0) {
      depth = 1;
    }
    maxDepth = Math.max(maxDepth, depth);
    columns.filter((column) => column.getIsVisible()).forEach((column) => {
      var _column$columns;
      if ((_column$columns = column.columns) != null && _column$columns.length) {
        findMaxDepth(column.columns, depth + 1);
      }
    }, 0);
  };
  findMaxDepth(allColumns);
  let headerGroups = [];
  const createHeaderGroup = (headersToGroup, depth) => {
    const headerGroup = {
      depth,
      id: [headerFamily, `${depth}`].filter(Boolean).join("_"),
      headers: []
    };
    const pendingParentHeaders = [];
    headersToGroup.forEach((headerToGroup) => {
      const latestPendingParentHeader = [...pendingParentHeaders].reverse()[0];
      const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
      let column;
      let isPlaceholder = false;
      if (isLeafHeader && headerToGroup.column.parent) {
        column = headerToGroup.column.parent;
      } else {
        column = headerToGroup.column;
        isPlaceholder = true;
      }
      if (latestPendingParentHeader && (latestPendingParentHeader == null ? void 0 : latestPendingParentHeader.column) === column) {
        latestPendingParentHeader.subHeaders.push(headerToGroup);
      } else {
        const header = createHeader(table, column, {
          id: [headerFamily, depth, column.id, headerToGroup == null ? void 0 : headerToGroup.id].filter(Boolean).join("_"),
          isPlaceholder,
          placeholderId: isPlaceholder ? `${pendingParentHeaders.filter((d) => d.column === column).length}` : void 0,
          depth,
          index: pendingParentHeaders.length
        });
        header.subHeaders.push(headerToGroup);
        pendingParentHeaders.push(header);
      }
      headerGroup.headers.push(headerToGroup);
      headerToGroup.headerGroup = headerGroup;
    });
    headerGroups.push(headerGroup);
    if (depth > 0) {
      createHeaderGroup(pendingParentHeaders, depth - 1);
    }
  };
  const bottomHeaders = columnsToGroup.map((column, index) => createHeader(table, column, {
    depth: maxDepth,
    index
  }));
  createHeaderGroup(bottomHeaders, maxDepth - 1);
  headerGroups.reverse();
  const recurseHeadersForSpans = (headers) => {
    const filteredHeaders = headers.filter((header) => header.column.getIsVisible());
    return filteredHeaders.map((header) => {
      let colSpan = 0;
      let rowSpan = 0;
      let childRowSpans = [0];
      if (header.subHeaders && header.subHeaders.length) {
        childRowSpans = [];
        recurseHeadersForSpans(header.subHeaders).forEach((_ref) => {
          let {
            colSpan: childColSpan,
            rowSpan: childRowSpan
          } = _ref;
          colSpan += childColSpan;
          childRowSpans.push(childRowSpan);
        });
      } else {
        colSpan = 1;
      }
      const minChildRowSpan = Math.min(...childRowSpans);
      rowSpan = rowSpan + minChildRowSpan;
      header.colSpan = colSpan;
      header.rowSpan = rowSpan;
      return {
        colSpan,
        rowSpan
      };
    });
  };
  recurseHeadersForSpans((_headerGroups$0$heade = (_headerGroups$ = headerGroups[0]) == null ? void 0 : _headerGroups$.headers) != null ? _headerGroups$0$heade : []);
  return headerGroups;
}
var createRow = (table, id, original, rowIndex, depth, subRows, parentId) => {
  let row = {
    id,
    index: rowIndex,
    original,
    depth,
    parentId,
    _valuesCache: {},
    _uniqueValuesCache: {},
    getValue: (columnId) => {
      if (row._valuesCache.hasOwnProperty(columnId)) {
        return row._valuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return void 0;
      }
      row._valuesCache[columnId] = column.accessorFn(row.original, rowIndex);
      return row._valuesCache[columnId];
    },
    getUniqueValues: (columnId) => {
      if (row._uniqueValuesCache.hasOwnProperty(columnId)) {
        return row._uniqueValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.accessorFn)) {
        return void 0;
      }
      if (!column.columnDef.getUniqueValues) {
        row._uniqueValuesCache[columnId] = [row.getValue(columnId)];
        return row._uniqueValuesCache[columnId];
      }
      row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, rowIndex);
      return row._uniqueValuesCache[columnId];
    },
    renderValue: (columnId) => {
      var _row$getValue;
      return (_row$getValue = row.getValue(columnId)) != null ? _row$getValue : table.options.renderFallbackValue;
    },
    subRows: subRows != null ? subRows : [],
    getLeafRows: () => flattenBy(row.subRows, (d) => d.subRows),
    getParentRow: () => row.parentId ? table.getRow(row.parentId, true) : void 0,
    getParentRows: () => {
      let parentRows = [];
      let currentRow = row;
      while (true) {
        const parentRow = currentRow.getParentRow();
        if (!parentRow) break;
        parentRows.push(parentRow);
        currentRow = parentRow;
      }
      return parentRows.reverse();
    },
    getAllCells: memo2(() => [table.getAllLeafColumns()], (leafColumns) => {
      return leafColumns.map((column) => {
        return createCell(table, row, column, column.id);
      });
    }, getMemoOptions(table.options, "debugRows", "getAllCells")),
    _getAllCellsByColumnId: memo2(() => [row.getAllCells()], (allCells) => {
      return allCells.reduce((acc, cell) => {
        acc[cell.column.id] = cell;
        return acc;
      }, {});
    }, getMemoOptions(table.options, "debugRows", "getAllCellsByColumnId"))
  };
  for (let i = 0; i < table._features.length; i++) {
    const feature = table._features[i];
    feature == null || feature.createRow == null || feature.createRow(row, table);
  }
  return row;
};
var ColumnFaceting = {
  createColumn: (column, table) => {
    column._getFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, column.id);
    column.getFacetedRowModel = () => {
      if (!column._getFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return column._getFacetedRowModel();
    };
    column._getFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, column.id);
    column.getFacetedUniqueValues = () => {
      if (!column._getFacetedUniqueValues) {
        return /* @__PURE__ */ new Map();
      }
      return column._getFacetedUniqueValues();
    };
    column._getFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, column.id);
    column.getFacetedMinMaxValues = () => {
      if (!column._getFacetedMinMaxValues) {
        return void 0;
      }
      return column._getFacetedMinMaxValues();
    };
  }
};
var includesString = (row, columnId, filterValue) => {
  var _filterValue$toString, _row$getValue;
  const search = filterValue == null || (_filterValue$toString = filterValue.toString()) == null ? void 0 : _filterValue$toString.toLowerCase();
  return Boolean((_row$getValue = row.getValue(columnId)) == null || (_row$getValue = _row$getValue.toString()) == null || (_row$getValue = _row$getValue.toLowerCase()) == null ? void 0 : _row$getValue.includes(search));
};
includesString.autoRemove = (val) => testFalsey(val);
var includesStringSensitive = (row, columnId, filterValue) => {
  var _row$getValue2;
  return Boolean((_row$getValue2 = row.getValue(columnId)) == null || (_row$getValue2 = _row$getValue2.toString()) == null ? void 0 : _row$getValue2.includes(filterValue));
};
includesStringSensitive.autoRemove = (val) => testFalsey(val);
var equalsString = (row, columnId, filterValue) => {
  var _row$getValue3;
  return ((_row$getValue3 = row.getValue(columnId)) == null || (_row$getValue3 = _row$getValue3.toString()) == null ? void 0 : _row$getValue3.toLowerCase()) === (filterValue == null ? void 0 : filterValue.toLowerCase());
};
equalsString.autoRemove = (val) => testFalsey(val);
var arrIncludes = (row, columnId, filterValue) => {
  var _row$getValue4;
  return (_row$getValue4 = row.getValue(columnId)) == null ? void 0 : _row$getValue4.includes(filterValue);
};
arrIncludes.autoRemove = (val) => testFalsey(val);
var arrIncludesAll = (row, columnId, filterValue) => {
  return !filterValue.some((val) => {
    var _row$getValue5;
    return !((_row$getValue5 = row.getValue(columnId)) != null && _row$getValue5.includes(val));
  });
};
arrIncludesAll.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
var arrIncludesSome = (row, columnId, filterValue) => {
  return filterValue.some((val) => {
    var _row$getValue6;
    return (_row$getValue6 = row.getValue(columnId)) == null ? void 0 : _row$getValue6.includes(val);
  });
};
arrIncludesSome.autoRemove = (val) => testFalsey(val) || !(val != null && val.length);
var equals = (row, columnId, filterValue) => {
  return row.getValue(columnId) === filterValue;
};
equals.autoRemove = (val) => testFalsey(val);
var weakEquals = (row, columnId, filterValue) => {
  return row.getValue(columnId) == filterValue;
};
weakEquals.autoRemove = (val) => testFalsey(val);
var inNumberRange = (row, columnId, filterValue) => {
  let [min2, max2] = filterValue;
  const rowValue = row.getValue(columnId);
  return rowValue >= min2 && rowValue <= max2;
};
inNumberRange.resolveFilterValue = (val) => {
  let [unsafeMin, unsafeMax] = val;
  let parsedMin = typeof unsafeMin !== "number" ? parseFloat(unsafeMin) : unsafeMin;
  let parsedMax = typeof unsafeMax !== "number" ? parseFloat(unsafeMax) : unsafeMax;
  let min2 = unsafeMin === null || Number.isNaN(parsedMin) ? -Infinity : parsedMin;
  let max2 = unsafeMax === null || Number.isNaN(parsedMax) ? Infinity : parsedMax;
  if (min2 > max2) {
    const temp = min2;
    min2 = max2;
    max2 = temp;
  }
  return [min2, max2];
};
inNumberRange.autoRemove = (val) => testFalsey(val) || testFalsey(val[0]) && testFalsey(val[1]);
var filterFns = {
  includesString,
  includesStringSensitive,
  equalsString,
  arrIncludes,
  arrIncludesAll,
  arrIncludesSome,
  equals,
  weakEquals,
  inNumberRange
};
function testFalsey(val) {
  return val === void 0 || val === null || val === "";
}
var ColumnFiltering = {
  getDefaultColumnDef: () => {
    return {
      filterFn: "auto"
    };
  },
  getInitialState: (state) => {
    return {
      columnFilters: [],
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnFiltersChange: makeStateUpdater("columnFilters", table),
      filterFromLeafRows: false,
      maxLeafRowFilterDepth: 100
    };
  },
  createColumn: (column, table) => {
    column.getAutoFilterFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "string") {
        return filterFns.includesString;
      }
      if (typeof value === "number") {
        return filterFns.inNumberRange;
      }
      if (typeof value === "boolean") {
        return filterFns.equals;
      }
      if (value !== null && typeof value === "object") {
        return filterFns.equals;
      }
      if (Array.isArray(value)) {
        return filterFns.arrIncludes;
      }
      return filterFns.weakEquals;
    };
    column.getFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      return isFunction(column.columnDef.filterFn) ? column.columnDef.filterFn : column.columnDef.filterFn === "auto" ? column.getAutoFilterFn() : (
        // @ts-ignore
        (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[column.columnDef.filterFn]) != null ? _table$options$filter : filterFns[column.columnDef.filterFn]
      );
    };
    column.getCanFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2;
      return ((_column$columnDef$ena = column.columnDef.enableColumnFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnFilters) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && !!column.accessorFn;
    };
    column.getIsFiltered = () => column.getFilterIndex() > -1;
    column.getFilterValue = () => {
      var _table$getState$colum;
      return (_table$getState$colum = table.getState().columnFilters) == null || (_table$getState$colum = _table$getState$colum.find((d) => d.id === column.id)) == null ? void 0 : _table$getState$colum.value;
    };
    column.getFilterIndex = () => {
      var _table$getState$colum2, _table$getState$colum3;
      return (_table$getState$colum2 = (_table$getState$colum3 = table.getState().columnFilters) == null ? void 0 : _table$getState$colum3.findIndex((d) => d.id === column.id)) != null ? _table$getState$colum2 : -1;
    };
    column.setFilterValue = (value) => {
      table.setColumnFilters((old) => {
        const filterFn = column.getFilterFn();
        const previousFilter = old == null ? void 0 : old.find((d) => d.id === column.id);
        const newFilter = functionalUpdate(value, previousFilter ? previousFilter.value : void 0);
        if (shouldAutoRemoveFilter(filterFn, newFilter, column)) {
          var _old$filter;
          return (_old$filter = old == null ? void 0 : old.filter((d) => d.id !== column.id)) != null ? _old$filter : [];
        }
        const newFilterObj = {
          id: column.id,
          value: newFilter
        };
        if (previousFilter) {
          var _old$map;
          return (_old$map = old == null ? void 0 : old.map((d) => {
            if (d.id === column.id) {
              return newFilterObj;
            }
            return d;
          })) != null ? _old$map : [];
        }
        if (old != null && old.length) {
          return [...old, newFilterObj];
        }
        return [newFilterObj];
      });
    };
  },
  createRow: (row, _table) => {
    row.columnFilters = {};
    row.columnFiltersMeta = {};
  },
  createTable: (table) => {
    table.setColumnFilters = (updater) => {
      const leafColumns = table.getAllLeafColumns();
      const updateFn = (old) => {
        var _functionalUpdate;
        return (_functionalUpdate = functionalUpdate(updater, old)) == null ? void 0 : _functionalUpdate.filter((filter) => {
          const column = leafColumns.find((d) => d.id === filter.id);
          if (column) {
            const filterFn = column.getFilterFn();
            if (shouldAutoRemoveFilter(filterFn, filter.value, column)) {
              return false;
            }
          }
          return true;
        });
      };
      table.options.onColumnFiltersChange == null || table.options.onColumnFiltersChange(updateFn);
    };
    table.resetColumnFilters = (defaultState) => {
      var _table$initialState$c, _table$initialState;
      table.setColumnFilters(defaultState ? [] : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnFilters) != null ? _table$initialState$c : []);
    };
    table.getPreFilteredRowModel = () => table.getCoreRowModel();
    table.getFilteredRowModel = () => {
      if (!table._getFilteredRowModel && table.options.getFilteredRowModel) {
        table._getFilteredRowModel = table.options.getFilteredRowModel(table);
      }
      if (table.options.manualFiltering || !table._getFilteredRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getFilteredRowModel();
    };
  }
};
function shouldAutoRemoveFilter(filterFn, value, column) {
  return (filterFn && filterFn.autoRemove ? filterFn.autoRemove(value, column) : false) || typeof value === "undefined" || typeof value === "string" && !value;
}
var sum = (columnId, _leafRows, childRows) => {
  return childRows.reduce((sum2, next) => {
    const nextValue = next.getValue(columnId);
    return sum2 + (typeof nextValue === "number" ? nextValue : 0);
  }, 0);
};
var min = (columnId, _leafRows, childRows) => {
  let min2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
      min2 = value;
    }
  });
  return min2;
};
var max = (columnId, _leafRows, childRows) => {
  let max2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
      max2 = value;
    }
  });
  return max2;
};
var extent = (columnId, _leafRows, childRows) => {
  let min2;
  let max2;
  childRows.forEach((row) => {
    const value = row.getValue(columnId);
    if (value != null) {
      if (min2 === void 0) {
        if (value >= value) min2 = max2 = value;
      } else {
        if (min2 > value) min2 = value;
        if (max2 < value) max2 = value;
      }
    }
  });
  return [min2, max2];
};
var mean = (columnId, leafRows) => {
  let count2 = 0;
  let sum2 = 0;
  leafRows.forEach((row) => {
    let value = row.getValue(columnId);
    if (value != null && (value = +value) >= value) {
      ++count2, sum2 += value;
    }
  });
  if (count2) return sum2 / count2;
  return;
};
var median = (columnId, leafRows) => {
  if (!leafRows.length) {
    return;
  }
  const values = leafRows.map((row) => row.getValue(columnId));
  if (!isNumberArray(values)) {
    return;
  }
  if (values.length === 1) {
    return values[0];
  }
  const mid = Math.floor(values.length / 2);
  const nums = values.sort((a, b) => a - b);
  return values.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
var unique = (columnId, leafRows) => {
  return Array.from(new Set(leafRows.map((d) => d.getValue(columnId))).values());
};
var uniqueCount = (columnId, leafRows) => {
  return new Set(leafRows.map((d) => d.getValue(columnId))).size;
};
var count = (_columnId, leafRows) => {
  return leafRows.length;
};
var aggregationFns = {
  sum,
  min,
  max,
  extent,
  mean,
  median,
  unique,
  uniqueCount,
  count
};
var ColumnGrouping = {
  getDefaultColumnDef: () => {
    return {
      aggregatedCell: (props) => {
        var _toString, _props$getValue;
        return (_toString = (_props$getValue = props.getValue()) == null || _props$getValue.toString == null ? void 0 : _props$getValue.toString()) != null ? _toString : null;
      },
      aggregationFn: "auto"
    };
  },
  getInitialState: (state) => {
    return {
      grouping: [],
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onGroupingChange: makeStateUpdater("grouping", table),
      groupedColumnMode: "reorder"
    };
  },
  createColumn: (column, table) => {
    column.toggleGrouping = () => {
      table.setGrouping((old) => {
        if (old != null && old.includes(column.id)) {
          return old.filter((d) => d !== column.id);
        }
        return [...old != null ? old : [], column.id];
      });
    };
    column.getCanGroup = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableGrouping) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGrouping) != null ? _table$options$enable : true) && (!!column.accessorFn || !!column.columnDef.getGroupingValue);
    };
    column.getIsGrouped = () => {
      var _table$getState$group;
      return (_table$getState$group = table.getState().grouping) == null ? void 0 : _table$getState$group.includes(column.id);
    };
    column.getGroupedIndex = () => {
      var _table$getState$group2;
      return (_table$getState$group2 = table.getState().grouping) == null ? void 0 : _table$getState$group2.indexOf(column.id);
    };
    column.getToggleGroupingHandler = () => {
      const canGroup = column.getCanGroup();
      return () => {
        if (!canGroup) return;
        column.toggleGrouping();
      };
    };
    column.getAutoAggregationFn = () => {
      const firstRow = table.getCoreRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "number") {
        return aggregationFns.sum;
      }
      if (Object.prototype.toString.call(value) === "[object Date]") {
        return aggregationFns.extent;
      }
    };
    column.getAggregationFn = () => {
      var _table$options$aggreg, _table$options$aggreg2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.aggregationFn) ? column.columnDef.aggregationFn : column.columnDef.aggregationFn === "auto" ? column.getAutoAggregationFn() : (_table$options$aggreg = (_table$options$aggreg2 = table.options.aggregationFns) == null ? void 0 : _table$options$aggreg2[column.columnDef.aggregationFn]) != null ? _table$options$aggreg : aggregationFns[column.columnDef.aggregationFn];
    };
  },
  createTable: (table) => {
    table.setGrouping = (updater) => table.options.onGroupingChange == null ? void 0 : table.options.onGroupingChange(updater);
    table.resetGrouping = (defaultState) => {
      var _table$initialState$g, _table$initialState;
      table.setGrouping(defaultState ? [] : (_table$initialState$g = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.grouping) != null ? _table$initialState$g : []);
    };
    table.getPreGroupedRowModel = () => table.getFilteredRowModel();
    table.getGroupedRowModel = () => {
      if (!table._getGroupedRowModel && table.options.getGroupedRowModel) {
        table._getGroupedRowModel = table.options.getGroupedRowModel(table);
      }
      if (table.options.manualGrouping || !table._getGroupedRowModel) {
        return table.getPreGroupedRowModel();
      }
      return table._getGroupedRowModel();
    };
  },
  createRow: (row, table) => {
    row.getIsGrouped = () => !!row.groupingColumnId;
    row.getGroupingValue = (columnId) => {
      if (row._groupingValuesCache.hasOwnProperty(columnId)) {
        return row._groupingValuesCache[columnId];
      }
      const column = table.getColumn(columnId);
      if (!(column != null && column.columnDef.getGroupingValue)) {
        return row.getValue(columnId);
      }
      row._groupingValuesCache[columnId] = column.columnDef.getGroupingValue(row.original);
      return row._groupingValuesCache[columnId];
    };
    row._groupingValuesCache = {};
  },
  createCell: (cell, column, row, table) => {
    cell.getIsGrouped = () => column.getIsGrouped() && column.id === row.groupingColumnId;
    cell.getIsPlaceholder = () => !cell.getIsGrouped() && column.getIsGrouped();
    cell.getIsAggregated = () => {
      var _row$subRows;
      return !cell.getIsGrouped() && !cell.getIsPlaceholder() && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
  }
};
function orderColumns(leafColumns, grouping, groupedColumnMode) {
  if (!(grouping != null && grouping.length) || !groupedColumnMode) {
    return leafColumns;
  }
  const nonGroupingColumns = leafColumns.filter((col) => !grouping.includes(col.id));
  if (groupedColumnMode === "remove") {
    return nonGroupingColumns;
  }
  const groupingColumns = grouping.map((g) => leafColumns.find((col) => col.id === g)).filter(Boolean);
  return [...groupingColumns, ...nonGroupingColumns];
}
var ColumnOrdering = {
  getInitialState: (state) => {
    return {
      columnOrder: [],
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnOrderChange: makeStateUpdater("columnOrder", table)
    };
  },
  createColumn: (column, table) => {
    column.getIndex = memo2((position) => [_getVisibleLeafColumns(table, position)], (columns) => columns.findIndex((d) => d.id === column.id), getMemoOptions(table.options, "debugColumns", "getIndex"));
    column.getIsFirstColumn = (position) => {
      var _columns$;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns$ = columns[0]) == null ? void 0 : _columns$.id) === column.id;
    };
    column.getIsLastColumn = (position) => {
      var _columns;
      const columns = _getVisibleLeafColumns(table, position);
      return ((_columns = columns[columns.length - 1]) == null ? void 0 : _columns.id) === column.id;
    };
  },
  createTable: (table) => {
    table.setColumnOrder = (updater) => table.options.onColumnOrderChange == null ? void 0 : table.options.onColumnOrderChange(updater);
    table.resetColumnOrder = (defaultState) => {
      var _table$initialState$c;
      table.setColumnOrder(defaultState ? [] : (_table$initialState$c = table.initialState.columnOrder) != null ? _table$initialState$c : []);
    };
    table._getOrderColumnsFn = memo2(() => [table.getState().columnOrder, table.getState().grouping, table.options.groupedColumnMode], (columnOrder, grouping, groupedColumnMode) => (columns) => {
      let orderedColumns = [];
      if (!(columnOrder != null && columnOrder.length)) {
        orderedColumns = columns;
      } else {
        const columnOrderCopy = [...columnOrder];
        const columnsCopy = [...columns];
        while (columnsCopy.length && columnOrderCopy.length) {
          const targetColumnId = columnOrderCopy.shift();
          const foundIndex = columnsCopy.findIndex((d) => d.id === targetColumnId);
          if (foundIndex > -1) {
            orderedColumns.push(columnsCopy.splice(foundIndex, 1)[0]);
          }
        }
        orderedColumns = [...orderedColumns, ...columnsCopy];
      }
      return orderColumns(orderedColumns, grouping, groupedColumnMode);
    }, getMemoOptions(table.options, "debugTable", "_getOrderColumnsFn"));
  }
};
var getDefaultColumnPinningState = () => ({
  left: [],
  right: []
});
var ColumnPinning = {
  getInitialState: (state) => {
    return {
      columnPinning: getDefaultColumnPinningState(),
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnPinningChange: makeStateUpdater("columnPinning", table)
    };
  },
  createColumn: (column, table) => {
    column.pin = (position) => {
      const columnIds = column.getLeafColumns().map((d) => d.id).filter(Boolean);
      table.setColumnPinning((old) => {
        var _old$left3, _old$right3;
        if (position === "right") {
          var _old$left, _old$right;
          return {
            left: ((_old$left = old == null ? void 0 : old.left) != null ? _old$left : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
            right: [...((_old$right = old == null ? void 0 : old.right) != null ? _old$right : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds]
          };
        }
        if (position === "left") {
          var _old$left2, _old$right2;
          return {
            left: [...((_old$left2 = old == null ? void 0 : old.left) != null ? _old$left2 : []).filter((d) => !(columnIds != null && columnIds.includes(d))), ...columnIds],
            right: ((_old$right2 = old == null ? void 0 : old.right) != null ? _old$right2 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
          };
        }
        return {
          left: ((_old$left3 = old == null ? void 0 : old.left) != null ? _old$left3 : []).filter((d) => !(columnIds != null && columnIds.includes(d))),
          right: ((_old$right3 = old == null ? void 0 : old.right) != null ? _old$right3 : []).filter((d) => !(columnIds != null && columnIds.includes(d)))
        };
      });
    };
    column.getCanPin = () => {
      const leafColumns = column.getLeafColumns();
      return leafColumns.some((d) => {
        var _d$columnDef$enablePi, _ref, _table$options$enable;
        return ((_d$columnDef$enablePi = d.columnDef.enablePinning) != null ? _d$columnDef$enablePi : true) && ((_ref = (_table$options$enable = table.options.enableColumnPinning) != null ? _table$options$enable : table.options.enablePinning) != null ? _ref : true);
      });
    };
    column.getIsPinned = () => {
      const leafColumnIds = column.getLeafColumns().map((d) => d.id);
      const {
        left,
        right
      } = table.getState().columnPinning;
      const isLeft = leafColumnIds.some((d) => left == null ? void 0 : left.includes(d));
      const isRight = leafColumnIds.some((d) => right == null ? void 0 : right.includes(d));
      return isLeft ? "left" : isRight ? "right" : false;
    };
    column.getPinnedIndex = () => {
      var _table$getState$colum, _table$getState$colum2;
      const position = column.getIsPinned();
      return position ? (_table$getState$colum = (_table$getState$colum2 = table.getState().columnPinning) == null || (_table$getState$colum2 = _table$getState$colum2[position]) == null ? void 0 : _table$getState$colum2.indexOf(column.id)) != null ? _table$getState$colum : -1 : 0;
    };
  },
  createRow: (row, table) => {
    row.getCenterVisibleCells = memo2(() => [row._getAllVisibleCells(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allCells, left, right) => {
      const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
      return allCells.filter((d) => !leftAndRight.includes(d.column.id));
    }, getMemoOptions(table.options, "debugRows", "getCenterVisibleCells"));
    row.getLeftVisibleCells = memo2(() => [row._getAllVisibleCells(), table.getState().columnPinning.left], (allCells, left) => {
      const cells = (left != null ? left : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => ({
        ...d,
        position: "left"
      }));
      return cells;
    }, getMemoOptions(table.options, "debugRows", "getLeftVisibleCells"));
    row.getRightVisibleCells = memo2(() => [row._getAllVisibleCells(), table.getState().columnPinning.right], (allCells, right) => {
      const cells = (right != null ? right : []).map((columnId) => allCells.find((cell) => cell.column.id === columnId)).filter(Boolean).map((d) => ({
        ...d,
        position: "right"
      }));
      return cells;
    }, getMemoOptions(table.options, "debugRows", "getRightVisibleCells"));
  },
  createTable: (table) => {
    table.setColumnPinning = (updater) => table.options.onColumnPinningChange == null ? void 0 : table.options.onColumnPinningChange(updater);
    table.resetColumnPinning = (defaultState) => {
      var _table$initialState$c, _table$initialState;
      return table.setColumnPinning(defaultState ? getDefaultColumnPinningState() : (_table$initialState$c = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.columnPinning) != null ? _table$initialState$c : getDefaultColumnPinningState());
    };
    table.getIsSomeColumnsPinned = (position) => {
      var _pinningState$positio;
      const pinningState = table.getState().columnPinning;
      if (!position) {
        var _pinningState$left, _pinningState$right;
        return Boolean(((_pinningState$left = pinningState.left) == null ? void 0 : _pinningState$left.length) || ((_pinningState$right = pinningState.right) == null ? void 0 : _pinningState$right.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table.getLeftLeafColumns = memo2(() => [table.getAllLeafColumns(), table.getState().columnPinning.left], (allColumns, left) => {
      return (left != null ? left : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, "debugColumns", "getLeftLeafColumns"));
    table.getRightLeafColumns = memo2(() => [table.getAllLeafColumns(), table.getState().columnPinning.right], (allColumns, right) => {
      return (right != null ? right : []).map((columnId) => allColumns.find((column) => column.id === columnId)).filter(Boolean);
    }, getMemoOptions(table.options, "debugColumns", "getRightLeafColumns"));
    table.getCenterLeafColumns = memo2(() => [table.getAllLeafColumns(), table.getState().columnPinning.left, table.getState().columnPinning.right], (allColumns, left, right) => {
      const leftAndRight = [...left != null ? left : [], ...right != null ? right : []];
      return allColumns.filter((d) => !leftAndRight.includes(d.id));
    }, getMemoOptions(table.options, "debugColumns", "getCenterLeafColumns"));
  }
};
function safelyAccessDocument(_document) {
  return _document || (typeof document !== "undefined" ? document : null);
}
var defaultColumnSizing = {
  size: 150,
  minSize: 20,
  maxSize: Number.MAX_SAFE_INTEGER
};
var getDefaultColumnSizingInfoState = () => ({
  startOffset: null,
  startSize: null,
  deltaOffset: null,
  deltaPercentage: null,
  isResizingColumn: false,
  columnSizingStart: []
});
var ColumnSizing = {
  getDefaultColumnDef: () => {
    return defaultColumnSizing;
  },
  getInitialState: (state) => {
    return {
      columnSizing: {},
      columnSizingInfo: getDefaultColumnSizingInfoState(),
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      columnResizeMode: "onEnd",
      columnResizeDirection: "ltr",
      onColumnSizingChange: makeStateUpdater("columnSizing", table),
      onColumnSizingInfoChange: makeStateUpdater("columnSizingInfo", table)
    };
  },
  createColumn: (column, table) => {
    column.getSize = () => {
      var _column$columnDef$min, _ref, _column$columnDef$max;
      const columnSize = table.getState().columnSizing[column.id];
      return Math.min(Math.max((_column$columnDef$min = column.columnDef.minSize) != null ? _column$columnDef$min : defaultColumnSizing.minSize, (_ref = columnSize != null ? columnSize : column.columnDef.size) != null ? _ref : defaultColumnSizing.size), (_column$columnDef$max = column.columnDef.maxSize) != null ? _column$columnDef$max : defaultColumnSizing.maxSize);
    };
    column.getStart = memo2((position) => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(0, column.getIndex(position)).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table.options, "debugColumns", "getStart"));
    column.getAfter = memo2((position) => [position, _getVisibleLeafColumns(table, position), table.getState().columnSizing], (position, columns) => columns.slice(column.getIndex(position) + 1).reduce((sum2, column2) => sum2 + column2.getSize(), 0), getMemoOptions(table.options, "debugColumns", "getAfter"));
    column.resetSize = () => {
      table.setColumnSizing((_ref2) => {
        let {
          [column.id]: _,
          ...rest
        } = _ref2;
        return rest;
      });
    };
    column.getCanResize = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableResizing) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableColumnResizing) != null ? _table$options$enable : true);
    };
    column.getIsResizing = () => {
      return table.getState().columnSizingInfo.isResizingColumn === column.id;
    };
  },
  createHeader: (header, table) => {
    header.getSize = () => {
      let sum2 = 0;
      const recurse = (header2) => {
        if (header2.subHeaders.length) {
          header2.subHeaders.forEach(recurse);
        } else {
          var _header$column$getSiz;
          sum2 += (_header$column$getSiz = header2.column.getSize()) != null ? _header$column$getSiz : 0;
        }
      };
      recurse(header);
      return sum2;
    };
    header.getStart = () => {
      if (header.index > 0) {
        const prevSiblingHeader = header.headerGroup.headers[header.index - 1];
        return prevSiblingHeader.getStart() + prevSiblingHeader.getSize();
      }
      return 0;
    };
    header.getResizeHandler = (_contextDocument) => {
      const column = table.getColumn(header.column.id);
      const canResize = column == null ? void 0 : column.getCanResize();
      return (e) => {
        if (!column || !canResize) {
          return;
        }
        e.persist == null || e.persist();
        if (isTouchStartEvent(e)) {
          if (e.touches && e.touches.length > 1) {
            return;
          }
        }
        const startSize = header.getSize();
        const columnSizingStart = header ? header.getLeafHeaders().map((d) => [d.column.id, d.column.getSize()]) : [[column.id, column.getSize()]];
        const clientX = isTouchStartEvent(e) ? Math.round(e.touches[0].clientX) : e.clientX;
        const newColumnSizing = {};
        const updateOffset = (eventType, clientXPos) => {
          if (typeof clientXPos !== "number") {
            return;
          }
          table.setColumnSizingInfo((old) => {
            var _old$startOffset, _old$startSize;
            const deltaDirection = table.options.columnResizeDirection === "rtl" ? -1 : 1;
            const deltaOffset = (clientXPos - ((_old$startOffset = old == null ? void 0 : old.startOffset) != null ? _old$startOffset : 0)) * deltaDirection;
            const deltaPercentage = Math.max(deltaOffset / ((_old$startSize = old == null ? void 0 : old.startSize) != null ? _old$startSize : 0), -0.999999);
            old.columnSizingStart.forEach((_ref3) => {
              let [columnId, headerSize] = _ref3;
              newColumnSizing[columnId] = Math.round(Math.max(headerSize + headerSize * deltaPercentage, 0) * 100) / 100;
            });
            return {
              ...old,
              deltaOffset,
              deltaPercentage
            };
          });
          if (table.options.columnResizeMode === "onChange" || eventType === "end") {
            table.setColumnSizing((old) => ({
              ...old,
              ...newColumnSizing
            }));
          }
        };
        const onMove = (clientXPos) => updateOffset("move", clientXPos);
        const onEnd = (clientXPos) => {
          updateOffset("end", clientXPos);
          table.setColumnSizingInfo((old) => ({
            ...old,
            isResizingColumn: false,
            startOffset: null,
            startSize: null,
            deltaOffset: null,
            deltaPercentage: null,
            columnSizingStart: []
          }));
        };
        const contextDocument = safelyAccessDocument(_contextDocument);
        const mouseEvents = {
          moveHandler: (e2) => onMove(e2.clientX),
          upHandler: (e2) => {
            contextDocument == null || contextDocument.removeEventListener("mousemove", mouseEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener("mouseup", mouseEvents.upHandler);
            onEnd(e2.clientX);
          }
        };
        const touchEvents = {
          moveHandler: (e2) => {
            if (e2.cancelable) {
              e2.preventDefault();
              e2.stopPropagation();
            }
            onMove(e2.touches[0].clientX);
            return false;
          },
          upHandler: (e2) => {
            var _e$touches$;
            contextDocument == null || contextDocument.removeEventListener("touchmove", touchEvents.moveHandler);
            contextDocument == null || contextDocument.removeEventListener("touchend", touchEvents.upHandler);
            if (e2.cancelable) {
              e2.preventDefault();
              e2.stopPropagation();
            }
            onEnd((_e$touches$ = e2.touches[0]) == null ? void 0 : _e$touches$.clientX);
          }
        };
        const passiveIfSupported = passiveEventSupported() ? {
          passive: false
        } : false;
        if (isTouchStartEvent(e)) {
          contextDocument == null || contextDocument.addEventListener("touchmove", touchEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener("touchend", touchEvents.upHandler, passiveIfSupported);
        } else {
          contextDocument == null || contextDocument.addEventListener("mousemove", mouseEvents.moveHandler, passiveIfSupported);
          contextDocument == null || contextDocument.addEventListener("mouseup", mouseEvents.upHandler, passiveIfSupported);
        }
        table.setColumnSizingInfo((old) => ({
          ...old,
          startOffset: clientX,
          startSize,
          deltaOffset: 0,
          deltaPercentage: 0,
          columnSizingStart,
          isResizingColumn: column.id
        }));
      };
    };
  },
  createTable: (table) => {
    table.setColumnSizing = (updater) => table.options.onColumnSizingChange == null ? void 0 : table.options.onColumnSizingChange(updater);
    table.setColumnSizingInfo = (updater) => table.options.onColumnSizingInfoChange == null ? void 0 : table.options.onColumnSizingInfoChange(updater);
    table.resetColumnSizing = (defaultState) => {
      var _table$initialState$c;
      table.setColumnSizing(defaultState ? {} : (_table$initialState$c = table.initialState.columnSizing) != null ? _table$initialState$c : {});
    };
    table.resetHeaderSizeInfo = (defaultState) => {
      var _table$initialState$c2;
      table.setColumnSizingInfo(defaultState ? getDefaultColumnSizingInfoState() : (_table$initialState$c2 = table.initialState.columnSizingInfo) != null ? _table$initialState$c2 : getDefaultColumnSizingInfoState());
    };
    table.getTotalSize = () => {
      var _table$getHeaderGroup, _table$getHeaderGroup2;
      return (_table$getHeaderGroup = (_table$getHeaderGroup2 = table.getHeaderGroups()[0]) == null ? void 0 : _table$getHeaderGroup2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getHeaderGroup : 0;
    };
    table.getLeftTotalSize = () => {
      var _table$getLeftHeaderG, _table$getLeftHeaderG2;
      return (_table$getLeftHeaderG = (_table$getLeftHeaderG2 = table.getLeftHeaderGroups()[0]) == null ? void 0 : _table$getLeftHeaderG2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getLeftHeaderG : 0;
    };
    table.getCenterTotalSize = () => {
      var _table$getCenterHeade, _table$getCenterHeade2;
      return (_table$getCenterHeade = (_table$getCenterHeade2 = table.getCenterHeaderGroups()[0]) == null ? void 0 : _table$getCenterHeade2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getCenterHeade : 0;
    };
    table.getRightTotalSize = () => {
      var _table$getRightHeader, _table$getRightHeader2;
      return (_table$getRightHeader = (_table$getRightHeader2 = table.getRightHeaderGroups()[0]) == null ? void 0 : _table$getRightHeader2.headers.reduce((sum2, header) => {
        return sum2 + header.getSize();
      }, 0)) != null ? _table$getRightHeader : 0;
    };
  }
};
var passiveSupported = null;
function passiveEventSupported() {
  if (typeof passiveSupported === "boolean") return passiveSupported;
  let supported = false;
  try {
    const options = {
      get passive() {
        supported = true;
        return false;
      }
    };
    const noop = () => {
    };
    window.addEventListener("test", noop, options);
    window.removeEventListener("test", noop);
  } catch (err) {
    supported = false;
  }
  passiveSupported = supported;
  return passiveSupported;
}
function isTouchStartEvent(e) {
  return e.type === "touchstart";
}
var ColumnVisibility = {
  getInitialState: (state) => {
    return {
      columnVisibility: {},
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onColumnVisibilityChange: makeStateUpdater("columnVisibility", table)
    };
  },
  createColumn: (column, table) => {
    column.toggleVisibility = (value) => {
      if (column.getCanHide()) {
        table.setColumnVisibility((old) => ({
          ...old,
          [column.id]: value != null ? value : !column.getIsVisible()
        }));
      }
    };
    column.getIsVisible = () => {
      var _ref, _table$getState$colum;
      const childColumns = column.columns;
      return (_ref = childColumns.length ? childColumns.some((c) => c.getIsVisible()) : (_table$getState$colum = table.getState().columnVisibility) == null ? void 0 : _table$getState$colum[column.id]) != null ? _ref : true;
    };
    column.getCanHide = () => {
      var _column$columnDef$ena, _table$options$enable;
      return ((_column$columnDef$ena = column.columnDef.enableHiding) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableHiding) != null ? _table$options$enable : true);
    };
    column.getToggleVisibilityHandler = () => {
      return (e) => {
        column.toggleVisibility == null || column.toggleVisibility(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row._getAllVisibleCells = memo2(() => [row.getAllCells(), table.getState().columnVisibility], (cells) => {
      return cells.filter((cell) => cell.column.getIsVisible());
    }, getMemoOptions(table.options, "debugRows", "_getAllVisibleCells"));
    row.getVisibleCells = memo2(() => [row.getLeftVisibleCells(), row.getCenterVisibleCells(), row.getRightVisibleCells()], (left, center, right) => [...left, ...center, ...right], getMemoOptions(table.options, "debugRows", "getVisibleCells"));
  },
  createTable: (table) => {
    const makeVisibleColumnsMethod = (key, getColumns) => {
      return memo2(() => [getColumns(), getColumns().filter((d) => d.getIsVisible()).map((d) => d.id).join("_")], (columns) => {
        return columns.filter((d) => d.getIsVisible == null ? void 0 : d.getIsVisible());
      }, getMemoOptions(table.options, "debugColumns", key));
    };
    table.getVisibleFlatColumns = makeVisibleColumnsMethod("getVisibleFlatColumns", () => table.getAllFlatColumns());
    table.getVisibleLeafColumns = makeVisibleColumnsMethod("getVisibleLeafColumns", () => table.getAllLeafColumns());
    table.getLeftVisibleLeafColumns = makeVisibleColumnsMethod("getLeftVisibleLeafColumns", () => table.getLeftLeafColumns());
    table.getRightVisibleLeafColumns = makeVisibleColumnsMethod("getRightVisibleLeafColumns", () => table.getRightLeafColumns());
    table.getCenterVisibleLeafColumns = makeVisibleColumnsMethod("getCenterVisibleLeafColumns", () => table.getCenterLeafColumns());
    table.setColumnVisibility = (updater) => table.options.onColumnVisibilityChange == null ? void 0 : table.options.onColumnVisibilityChange(updater);
    table.resetColumnVisibility = (defaultState) => {
      var _table$initialState$c;
      table.setColumnVisibility(defaultState ? {} : (_table$initialState$c = table.initialState.columnVisibility) != null ? _table$initialState$c : {});
    };
    table.toggleAllColumnsVisible = (value) => {
      var _value;
      value = (_value = value) != null ? _value : !table.getIsAllColumnsVisible();
      table.setColumnVisibility(table.getAllLeafColumns().reduce((obj, column) => ({
        ...obj,
        [column.id]: !value ? !(column.getCanHide != null && column.getCanHide()) : value
      }), {}));
    };
    table.getIsAllColumnsVisible = () => !table.getAllLeafColumns().some((column) => !(column.getIsVisible != null && column.getIsVisible()));
    table.getIsSomeColumnsVisible = () => table.getAllLeafColumns().some((column) => column.getIsVisible == null ? void 0 : column.getIsVisible());
    table.getToggleAllColumnsVisibilityHandler = () => {
      return (e) => {
        var _target;
        table.toggleAllColumnsVisible((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
function _getVisibleLeafColumns(table, position) {
  return !position ? table.getVisibleLeafColumns() : position === "center" ? table.getCenterVisibleLeafColumns() : position === "left" ? table.getLeftVisibleLeafColumns() : table.getRightVisibleLeafColumns();
}
var GlobalFaceting = {
  createTable: (table) => {
    table._getGlobalFacetedRowModel = table.options.getFacetedRowModel && table.options.getFacetedRowModel(table, "__global__");
    table.getGlobalFacetedRowModel = () => {
      if (table.options.manualFiltering || !table._getGlobalFacetedRowModel) {
        return table.getPreFilteredRowModel();
      }
      return table._getGlobalFacetedRowModel();
    };
    table._getGlobalFacetedUniqueValues = table.options.getFacetedUniqueValues && table.options.getFacetedUniqueValues(table, "__global__");
    table.getGlobalFacetedUniqueValues = () => {
      if (!table._getGlobalFacetedUniqueValues) {
        return /* @__PURE__ */ new Map();
      }
      return table._getGlobalFacetedUniqueValues();
    };
    table._getGlobalFacetedMinMaxValues = table.options.getFacetedMinMaxValues && table.options.getFacetedMinMaxValues(table, "__global__");
    table.getGlobalFacetedMinMaxValues = () => {
      if (!table._getGlobalFacetedMinMaxValues) {
        return;
      }
      return table._getGlobalFacetedMinMaxValues();
    };
  }
};
var GlobalFiltering = {
  getInitialState: (state) => {
    return {
      globalFilter: void 0,
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onGlobalFilterChange: makeStateUpdater("globalFilter", table),
      globalFilterFn: "auto",
      getColumnCanGlobalFilter: (column) => {
        var _table$getCoreRowMode;
        const value = (_table$getCoreRowMode = table.getCoreRowModel().flatRows[0]) == null || (_table$getCoreRowMode = _table$getCoreRowMode._getAllCellsByColumnId()[column.id]) == null ? void 0 : _table$getCoreRowMode.getValue();
        return typeof value === "string" || typeof value === "number";
      }
    };
  },
  createColumn: (column, table) => {
    column.getCanGlobalFilter = () => {
      var _column$columnDef$ena, _table$options$enable, _table$options$enable2, _table$options$getCol;
      return ((_column$columnDef$ena = column.columnDef.enableGlobalFilter) != null ? _column$columnDef$ena : true) && ((_table$options$enable = table.options.enableGlobalFilter) != null ? _table$options$enable : true) && ((_table$options$enable2 = table.options.enableFilters) != null ? _table$options$enable2 : true) && ((_table$options$getCol = table.options.getColumnCanGlobalFilter == null ? void 0 : table.options.getColumnCanGlobalFilter(column)) != null ? _table$options$getCol : true) && !!column.accessorFn;
    };
  },
  createTable: (table) => {
    table.getGlobalAutoFilterFn = () => {
      return filterFns.includesString;
    };
    table.getGlobalFilterFn = () => {
      var _table$options$filter, _table$options$filter2;
      const {
        globalFilterFn
      } = table.options;
      return isFunction(globalFilterFn) ? globalFilterFn : globalFilterFn === "auto" ? table.getGlobalAutoFilterFn() : (_table$options$filter = (_table$options$filter2 = table.options.filterFns) == null ? void 0 : _table$options$filter2[globalFilterFn]) != null ? _table$options$filter : filterFns[globalFilterFn];
    };
    table.setGlobalFilter = (updater) => {
      table.options.onGlobalFilterChange == null || table.options.onGlobalFilterChange(updater);
    };
    table.resetGlobalFilter = (defaultState) => {
      table.setGlobalFilter(defaultState ? void 0 : table.initialState.globalFilter);
    };
  }
};
var RowExpanding = {
  getInitialState: (state) => {
    return {
      expanded: {},
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onExpandedChange: makeStateUpdater("expanded", table),
      paginateExpandedRows: true
    };
  },
  createTable: (table) => {
    let registered = false;
    let queued = false;
    table._autoResetExpanded = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetExpanded) != null ? _ref : !table.options.manualExpanding) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetExpanded();
          queued = false;
        });
      }
    };
    table.setExpanded = (updater) => table.options.onExpandedChange == null ? void 0 : table.options.onExpandedChange(updater);
    table.toggleAllRowsExpanded = (expanded) => {
      if (expanded != null ? expanded : !table.getIsAllRowsExpanded()) {
        table.setExpanded(true);
      } else {
        table.setExpanded({});
      }
    };
    table.resetExpanded = (defaultState) => {
      var _table$initialState$e, _table$initialState;
      table.setExpanded(defaultState ? {} : (_table$initialState$e = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.expanded) != null ? _table$initialState$e : {});
    };
    table.getCanSomeRowsExpand = () => {
      return table.getPrePaginationRowModel().flatRows.some((row) => row.getCanExpand());
    };
    table.getToggleAllRowsExpandedHandler = () => {
      return (e) => {
        e.persist == null || e.persist();
        table.toggleAllRowsExpanded();
      };
    };
    table.getIsSomeRowsExpanded = () => {
      const expanded = table.getState().expanded;
      return expanded === true || Object.values(expanded).some(Boolean);
    };
    table.getIsAllRowsExpanded = () => {
      const expanded = table.getState().expanded;
      if (typeof expanded === "boolean") {
        return expanded === true;
      }
      if (!Object.keys(expanded).length) {
        return false;
      }
      if (table.getRowModel().flatRows.some((row) => !row.getIsExpanded())) {
        return false;
      }
      return true;
    };
    table.getExpandedDepth = () => {
      let maxDepth = 0;
      const rowIds = table.getState().expanded === true ? Object.keys(table.getRowModel().rowsById) : Object.keys(table.getState().expanded);
      rowIds.forEach((id) => {
        const splitId = id.split(".");
        maxDepth = Math.max(maxDepth, splitId.length);
      });
      return maxDepth;
    };
    table.getPreExpandedRowModel = () => table.getSortedRowModel();
    table.getExpandedRowModel = () => {
      if (!table._getExpandedRowModel && table.options.getExpandedRowModel) {
        table._getExpandedRowModel = table.options.getExpandedRowModel(table);
      }
      if (table.options.manualExpanding || !table._getExpandedRowModel) {
        return table.getPreExpandedRowModel();
      }
      return table._getExpandedRowModel();
    };
  },
  createRow: (row, table) => {
    row.toggleExpanded = (expanded) => {
      table.setExpanded((old) => {
        var _expanded;
        const exists = old === true ? true : !!(old != null && old[row.id]);
        let oldExpanded = {};
        if (old === true) {
          Object.keys(table.getRowModel().rowsById).forEach((rowId) => {
            oldExpanded[rowId] = true;
          });
        } else {
          oldExpanded = old;
        }
        expanded = (_expanded = expanded) != null ? _expanded : !exists;
        if (!exists && expanded) {
          return {
            ...oldExpanded,
            [row.id]: true
          };
        }
        if (exists && !expanded) {
          const {
            [row.id]: _,
            ...rest
          } = oldExpanded;
          return rest;
        }
        return old;
      });
    };
    row.getIsExpanded = () => {
      var _table$options$getIsR;
      const expanded = table.getState().expanded;
      return !!((_table$options$getIsR = table.options.getIsRowExpanded == null ? void 0 : table.options.getIsRowExpanded(row)) != null ? _table$options$getIsR : expanded === true || (expanded == null ? void 0 : expanded[row.id]));
    };
    row.getCanExpand = () => {
      var _table$options$getRow, _table$options$enable, _row$subRows;
      return (_table$options$getRow = table.options.getRowCanExpand == null ? void 0 : table.options.getRowCanExpand(row)) != null ? _table$options$getRow : ((_table$options$enable = table.options.enableExpanding) != null ? _table$options$enable : true) && !!((_row$subRows = row.subRows) != null && _row$subRows.length);
    };
    row.getIsAllParentsExpanded = () => {
      let isFullyExpanded = true;
      let currentRow = row;
      while (isFullyExpanded && currentRow.parentId) {
        currentRow = table.getRow(currentRow.parentId, true);
        isFullyExpanded = currentRow.getIsExpanded();
      }
      return isFullyExpanded;
    };
    row.getToggleExpandedHandler = () => {
      const canExpand = row.getCanExpand();
      return () => {
        if (!canExpand) return;
        row.toggleExpanded();
      };
    };
  }
};
var defaultPageIndex = 0;
var defaultPageSize = 10;
var getDefaultPaginationState = () => ({
  pageIndex: defaultPageIndex,
  pageSize: defaultPageSize
});
var RowPagination = {
  getInitialState: (state) => {
    return {
      ...state,
      pagination: {
        ...getDefaultPaginationState(),
        ...state == null ? void 0 : state.pagination
      }
    };
  },
  getDefaultOptions: (table) => {
    return {
      onPaginationChange: makeStateUpdater("pagination", table)
    };
  },
  createTable: (table) => {
    let registered = false;
    let queued = false;
    table._autoResetPageIndex = () => {
      var _ref, _table$options$autoRe;
      if (!registered) {
        table._queue(() => {
          registered = true;
        });
        return;
      }
      if ((_ref = (_table$options$autoRe = table.options.autoResetAll) != null ? _table$options$autoRe : table.options.autoResetPageIndex) != null ? _ref : !table.options.manualPagination) {
        if (queued) return;
        queued = true;
        table._queue(() => {
          table.resetPageIndex();
          queued = false;
        });
      }
    };
    table.setPagination = (updater) => {
      const safeUpdater = (old) => {
        let newState = functionalUpdate(updater, old);
        return newState;
      };
      return table.options.onPaginationChange == null ? void 0 : table.options.onPaginationChange(safeUpdater);
    };
    table.resetPagination = (defaultState) => {
      var _table$initialState$p;
      table.setPagination(defaultState ? getDefaultPaginationState() : (_table$initialState$p = table.initialState.pagination) != null ? _table$initialState$p : getDefaultPaginationState());
    };
    table.setPageIndex = (updater) => {
      table.setPagination((old) => {
        let pageIndex = functionalUpdate(updater, old.pageIndex);
        const maxPageIndex = typeof table.options.pageCount === "undefined" || table.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table.options.pageCount - 1;
        pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
        return {
          ...old,
          pageIndex
        };
      });
    };
    table.resetPageIndex = (defaultState) => {
      var _table$initialState$p2, _table$initialState;
      table.setPageIndex(defaultState ? defaultPageIndex : (_table$initialState$p2 = (_table$initialState = table.initialState) == null || (_table$initialState = _table$initialState.pagination) == null ? void 0 : _table$initialState.pageIndex) != null ? _table$initialState$p2 : defaultPageIndex);
    };
    table.resetPageSize = (defaultState) => {
      var _table$initialState$p3, _table$initialState2;
      table.setPageSize(defaultState ? defaultPageSize : (_table$initialState$p3 = (_table$initialState2 = table.initialState) == null || (_table$initialState2 = _table$initialState2.pagination) == null ? void 0 : _table$initialState2.pageSize) != null ? _table$initialState$p3 : defaultPageSize);
    };
    table.setPageSize = (updater) => {
      table.setPagination((old) => {
        const pageSize = Math.max(1, functionalUpdate(updater, old.pageSize));
        const topRowIndex = old.pageSize * old.pageIndex;
        const pageIndex = Math.floor(topRowIndex / pageSize);
        return {
          ...old,
          pageIndex,
          pageSize
        };
      });
    };
    table.setPageCount = (updater) => table.setPagination((old) => {
      var _table$options$pageCo;
      let newPageCount = functionalUpdate(updater, (_table$options$pageCo = table.options.pageCount) != null ? _table$options$pageCo : -1);
      if (typeof newPageCount === "number") {
        newPageCount = Math.max(-1, newPageCount);
      }
      return {
        ...old,
        pageCount: newPageCount
      };
    });
    table.getPageOptions = memo2(() => [table.getPageCount()], (pageCount) => {
      let pageOptions = [];
      if (pageCount && pageCount > 0) {
        pageOptions = [...new Array(pageCount)].fill(null).map((_, i) => i);
      }
      return pageOptions;
    }, getMemoOptions(table.options, "debugTable", "getPageOptions"));
    table.getCanPreviousPage = () => table.getState().pagination.pageIndex > 0;
    table.getCanNextPage = () => {
      const {
        pageIndex
      } = table.getState().pagination;
      const pageCount = table.getPageCount();
      if (pageCount === -1) {
        return true;
      }
      if (pageCount === 0) {
        return false;
      }
      return pageIndex < pageCount - 1;
    };
    table.previousPage = () => {
      return table.setPageIndex((old) => old - 1);
    };
    table.nextPage = () => {
      return table.setPageIndex((old) => {
        return old + 1;
      });
    };
    table.firstPage = () => {
      return table.setPageIndex(0);
    };
    table.lastPage = () => {
      return table.setPageIndex(table.getPageCount() - 1);
    };
    table.getPrePaginationRowModel = () => table.getExpandedRowModel();
    table.getPaginationRowModel = () => {
      if (!table._getPaginationRowModel && table.options.getPaginationRowModel) {
        table._getPaginationRowModel = table.options.getPaginationRowModel(table);
      }
      if (table.options.manualPagination || !table._getPaginationRowModel) {
        return table.getPrePaginationRowModel();
      }
      return table._getPaginationRowModel();
    };
    table.getPageCount = () => {
      var _table$options$pageCo2;
      return (_table$options$pageCo2 = table.options.pageCount) != null ? _table$options$pageCo2 : Math.ceil(table.getRowCount() / table.getState().pagination.pageSize);
    };
    table.getRowCount = () => {
      var _table$options$rowCou;
      return (_table$options$rowCou = table.options.rowCount) != null ? _table$options$rowCou : table.getPrePaginationRowModel().rows.length;
    };
  }
};
var getDefaultRowPinningState = () => ({
  top: [],
  bottom: []
});
var RowPinning = {
  getInitialState: (state) => {
    return {
      rowPinning: getDefaultRowPinningState(),
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onRowPinningChange: makeStateUpdater("rowPinning", table)
    };
  },
  createRow: (row, table) => {
    row.pin = (position, includeLeafRows, includeParentRows) => {
      const leafRowIds = includeLeafRows ? row.getLeafRows().map((_ref) => {
        let {
          id
        } = _ref;
        return id;
      }) : [];
      const parentRowIds = includeParentRows ? row.getParentRows().map((_ref2) => {
        let {
          id
        } = _ref2;
        return id;
      }) : [];
      const rowIds = /* @__PURE__ */ new Set([...parentRowIds, row.id, ...leafRowIds]);
      table.setRowPinning((old) => {
        var _old$top3, _old$bottom3;
        if (position === "bottom") {
          var _old$top, _old$bottom;
          return {
            top: ((_old$top = old == null ? void 0 : old.top) != null ? _old$top : []).filter((d) => !(rowIds != null && rowIds.has(d))),
            bottom: [...((_old$bottom = old == null ? void 0 : old.bottom) != null ? _old$bottom : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)]
          };
        }
        if (position === "top") {
          var _old$top2, _old$bottom2;
          return {
            top: [...((_old$top2 = old == null ? void 0 : old.top) != null ? _old$top2 : []).filter((d) => !(rowIds != null && rowIds.has(d))), ...Array.from(rowIds)],
            bottom: ((_old$bottom2 = old == null ? void 0 : old.bottom) != null ? _old$bottom2 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
          };
        }
        return {
          top: ((_old$top3 = old == null ? void 0 : old.top) != null ? _old$top3 : []).filter((d) => !(rowIds != null && rowIds.has(d))),
          bottom: ((_old$bottom3 = old == null ? void 0 : old.bottom) != null ? _old$bottom3 : []).filter((d) => !(rowIds != null && rowIds.has(d)))
        };
      });
    };
    row.getCanPin = () => {
      var _ref3;
      const {
        enableRowPinning,
        enablePinning
      } = table.options;
      if (typeof enableRowPinning === "function") {
        return enableRowPinning(row);
      }
      return (_ref3 = enableRowPinning != null ? enableRowPinning : enablePinning) != null ? _ref3 : true;
    };
    row.getIsPinned = () => {
      const rowIds = [row.id];
      const {
        top,
        bottom
      } = table.getState().rowPinning;
      const isTop = rowIds.some((d) => top == null ? void 0 : top.includes(d));
      const isBottom = rowIds.some((d) => bottom == null ? void 0 : bottom.includes(d));
      return isTop ? "top" : isBottom ? "bottom" : false;
    };
    row.getPinnedIndex = () => {
      var _ref4, _visiblePinnedRowIds$;
      const position = row.getIsPinned();
      if (!position) return -1;
      const visiblePinnedRowIds = (_ref4 = position === "top" ? table.getTopRows() : table.getBottomRows()) == null ? void 0 : _ref4.map((_ref5) => {
        let {
          id
        } = _ref5;
        return id;
      });
      return (_visiblePinnedRowIds$ = visiblePinnedRowIds == null ? void 0 : visiblePinnedRowIds.indexOf(row.id)) != null ? _visiblePinnedRowIds$ : -1;
    };
  },
  createTable: (table) => {
    table.setRowPinning = (updater) => table.options.onRowPinningChange == null ? void 0 : table.options.onRowPinningChange(updater);
    table.resetRowPinning = (defaultState) => {
      var _table$initialState$r, _table$initialState;
      return table.setRowPinning(defaultState ? getDefaultRowPinningState() : (_table$initialState$r = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.rowPinning) != null ? _table$initialState$r : getDefaultRowPinningState());
    };
    table.getIsSomeRowsPinned = (position) => {
      var _pinningState$positio;
      const pinningState = table.getState().rowPinning;
      if (!position) {
        var _pinningState$top, _pinningState$bottom;
        return Boolean(((_pinningState$top = pinningState.top) == null ? void 0 : _pinningState$top.length) || ((_pinningState$bottom = pinningState.bottom) == null ? void 0 : _pinningState$bottom.length));
      }
      return Boolean((_pinningState$positio = pinningState[position]) == null ? void 0 : _pinningState$positio.length);
    };
    table._getPinnedRows = (visibleRows, pinnedRowIds, position) => {
      var _table$options$keepPi;
      const rows = ((_table$options$keepPi = table.options.keepPinnedRows) != null ? _table$options$keepPi : true) ? (
        //get all rows that are pinned even if they would not be otherwise visible
        //account for expanded parent rows, but not pagination or filtering
        (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => {
          const row = table.getRow(rowId, true);
          return row.getIsAllParentsExpanded() ? row : null;
        })
      ) : (
        //else get only visible rows that are pinned
        (pinnedRowIds != null ? pinnedRowIds : []).map((rowId) => visibleRows.find((row) => row.id === rowId))
      );
      return rows.filter(Boolean).map((d) => ({
        ...d,
        position
      }));
    };
    table.getTopRows = memo2(() => [table.getRowModel().rows, table.getState().rowPinning.top], (allRows, topPinnedRowIds) => table._getPinnedRows(allRows, topPinnedRowIds, "top"), getMemoOptions(table.options, "debugRows", "getTopRows"));
    table.getBottomRows = memo2(() => [table.getRowModel().rows, table.getState().rowPinning.bottom], (allRows, bottomPinnedRowIds) => table._getPinnedRows(allRows, bottomPinnedRowIds, "bottom"), getMemoOptions(table.options, "debugRows", "getBottomRows"));
    table.getCenterRows = memo2(() => [table.getRowModel().rows, table.getState().rowPinning.top, table.getState().rowPinning.bottom], (allRows, top, bottom) => {
      const topAndBottom = /* @__PURE__ */ new Set([...top != null ? top : [], ...bottom != null ? bottom : []]);
      return allRows.filter((d) => !topAndBottom.has(d.id));
    }, getMemoOptions(table.options, "debugRows", "getCenterRows"));
  }
};
var RowSelection = {
  getInitialState: (state) => {
    return {
      rowSelection: {},
      ...state
    };
  },
  getDefaultOptions: (table) => {
    return {
      onRowSelectionChange: makeStateUpdater("rowSelection", table),
      enableRowSelection: true,
      enableMultiRowSelection: true,
      enableSubRowSelection: true
      // enableGroupingRowSelection: false,
      // isAdditiveSelectEvent: (e: unknown) => !!e.metaKey,
      // isInclusiveSelectEvent: (e: unknown) => !!e.shiftKey,
    };
  },
  createTable: (table) => {
    table.setRowSelection = (updater) => table.options.onRowSelectionChange == null ? void 0 : table.options.onRowSelectionChange(updater);
    table.resetRowSelection = (defaultState) => {
      var _table$initialState$r;
      return table.setRowSelection(defaultState ? {} : (_table$initialState$r = table.initialState.rowSelection) != null ? _table$initialState$r : {});
    };
    table.toggleAllRowsSelected = (value) => {
      table.setRowSelection((old) => {
        value = typeof value !== "undefined" ? value : !table.getIsAllRowsSelected();
        const rowSelection = {
          ...old
        };
        const preGroupedFlatRows = table.getPreGroupedRowModel().flatRows;
        if (value) {
          preGroupedFlatRows.forEach((row) => {
            if (!row.getCanSelect()) {
              return;
            }
            rowSelection[row.id] = true;
          });
        } else {
          preGroupedFlatRows.forEach((row) => {
            delete rowSelection[row.id];
          });
        }
        return rowSelection;
      });
    };
    table.toggleAllPageRowsSelected = (value) => table.setRowSelection((old) => {
      const resolvedValue = typeof value !== "undefined" ? value : !table.getIsAllPageRowsSelected();
      const rowSelection = {
        ...old
      };
      table.getRowModel().rows.forEach((row) => {
        mutateRowIsSelected(rowSelection, row.id, resolvedValue, true, table);
      });
      return rowSelection;
    });
    table.getPreSelectedRowModel = () => table.getCoreRowModel();
    table.getSelectedRowModel = memo2(() => [table.getState().rowSelection, table.getCoreRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable", "getSelectedRowModel"));
    table.getFilteredSelectedRowModel = memo2(() => [table.getState().rowSelection, table.getFilteredRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable", "getFilteredSelectedRowModel"));
    table.getGroupedSelectedRowModel = memo2(() => [table.getState().rowSelection, table.getSortedRowModel()], (rowSelection, rowModel) => {
      if (!Object.keys(rowSelection).length) {
        return {
          rows: [],
          flatRows: [],
          rowsById: {}
        };
      }
      return selectRowsFn(table, rowModel);
    }, getMemoOptions(table.options, "debugTable", "getGroupedSelectedRowModel"));
    table.getIsAllRowsSelected = () => {
      const preGroupedFlatRows = table.getFilteredRowModel().flatRows;
      const {
        rowSelection
      } = table.getState();
      let isAllRowsSelected = Boolean(preGroupedFlatRows.length && Object.keys(rowSelection).length);
      if (isAllRowsSelected) {
        if (preGroupedFlatRows.some((row) => row.getCanSelect() && !rowSelection[row.id])) {
          isAllRowsSelected = false;
        }
      }
      return isAllRowsSelected;
    };
    table.getIsAllPageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows.filter((row) => row.getCanSelect());
      const {
        rowSelection
      } = table.getState();
      let isAllPageRowsSelected = !!paginationFlatRows.length;
      if (isAllPageRowsSelected && paginationFlatRows.some((row) => !rowSelection[row.id])) {
        isAllPageRowsSelected = false;
      }
      return isAllPageRowsSelected;
    };
    table.getIsSomeRowsSelected = () => {
      var _table$getState$rowSe;
      const totalSelected = Object.keys((_table$getState$rowSe = table.getState().rowSelection) != null ? _table$getState$rowSe : {}).length;
      return totalSelected > 0 && totalSelected < table.getFilteredRowModel().flatRows.length;
    };
    table.getIsSomePageRowsSelected = () => {
      const paginationFlatRows = table.getPaginationRowModel().flatRows;
      return table.getIsAllPageRowsSelected() ? false : paginationFlatRows.filter((row) => row.getCanSelect()).some((d) => d.getIsSelected() || d.getIsSomeSelected());
    };
    table.getToggleAllRowsSelectedHandler = () => {
      return (e) => {
        table.toggleAllRowsSelected(e.target.checked);
      };
    };
    table.getToggleAllPageRowsSelectedHandler = () => {
      return (e) => {
        table.toggleAllPageRowsSelected(e.target.checked);
      };
    };
  },
  createRow: (row, table) => {
    row.toggleSelected = (value, opts) => {
      const isSelected = row.getIsSelected();
      table.setRowSelection((old) => {
        var _opts$selectChildren;
        value = typeof value !== "undefined" ? value : !isSelected;
        if (row.getCanSelect() && isSelected === value) {
          return old;
        }
        const selectedRowIds = {
          ...old
        };
        mutateRowIsSelected(selectedRowIds, row.id, value, (_opts$selectChildren = opts == null ? void 0 : opts.selectChildren) != null ? _opts$selectChildren : true, table);
        return selectedRowIds;
      });
    };
    row.getIsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isRowSelected(row, rowSelection);
    };
    row.getIsSomeSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === "some";
    };
    row.getIsAllSubRowsSelected = () => {
      const {
        rowSelection
      } = table.getState();
      return isSubRowSelected(row, rowSelection) === "all";
    };
    row.getCanSelect = () => {
      var _table$options$enable;
      if (typeof table.options.enableRowSelection === "function") {
        return table.options.enableRowSelection(row);
      }
      return (_table$options$enable = table.options.enableRowSelection) != null ? _table$options$enable : true;
    };
    row.getCanSelectSubRows = () => {
      var _table$options$enable2;
      if (typeof table.options.enableSubRowSelection === "function") {
        return table.options.enableSubRowSelection(row);
      }
      return (_table$options$enable2 = table.options.enableSubRowSelection) != null ? _table$options$enable2 : true;
    };
    row.getCanMultiSelect = () => {
      var _table$options$enable3;
      if (typeof table.options.enableMultiRowSelection === "function") {
        return table.options.enableMultiRowSelection(row);
      }
      return (_table$options$enable3 = table.options.enableMultiRowSelection) != null ? _table$options$enable3 : true;
    };
    row.getToggleSelectedHandler = () => {
      const canSelect = row.getCanSelect();
      return (e) => {
        var _target;
        if (!canSelect) return;
        row.toggleSelected((_target = e.target) == null ? void 0 : _target.checked);
      };
    };
  }
};
var mutateRowIsSelected = (selectedRowIds, id, value, includeChildren, table) => {
  var _row$subRows;
  const row = table.getRow(id, true);
  if (value) {
    if (!row.getCanMultiSelect()) {
      Object.keys(selectedRowIds).forEach((key) => delete selectedRowIds[key]);
    }
    if (row.getCanSelect()) {
      selectedRowIds[id] = true;
    }
  } else {
    delete selectedRowIds[id];
  }
  if (includeChildren && (_row$subRows = row.subRows) != null && _row$subRows.length && row.getCanSelectSubRows()) {
    row.subRows.forEach((row2) => mutateRowIsSelected(selectedRowIds, row2.id, value, includeChildren, table));
  }
};
function selectRowsFn(table, rowModel) {
  const rowSelection = table.getState().rowSelection;
  const newSelectedFlatRows = [];
  const newSelectedRowsById = {};
  const recurseRows = function(rows, depth) {
    return rows.map((row) => {
      var _row$subRows2;
      const isSelected = isRowSelected(row, rowSelection);
      if (isSelected) {
        newSelectedFlatRows.push(row);
        newSelectedRowsById[row.id] = row;
      }
      if ((_row$subRows2 = row.subRows) != null && _row$subRows2.length) {
        row = {
          ...row,
          subRows: recurseRows(row.subRows)
        };
      }
      if (isSelected) {
        return row;
      }
    }).filter(Boolean);
  };
  return {
    rows: recurseRows(rowModel.rows),
    flatRows: newSelectedFlatRows,
    rowsById: newSelectedRowsById
  };
}
function isRowSelected(row, selection) {
  var _selection$row$id;
  return (_selection$row$id = selection[row.id]) != null ? _selection$row$id : false;
}
function isSubRowSelected(row, selection, table) {
  var _row$subRows3;
  if (!((_row$subRows3 = row.subRows) != null && _row$subRows3.length)) return false;
  let allChildrenSelected = true;
  let someSelected = false;
  row.subRows.forEach((subRow) => {
    if (someSelected && !allChildrenSelected) {
      return;
    }
    if (subRow.getCanSelect()) {
      if (isRowSelected(subRow, selection)) {
        someSelected = true;
      } else {
        allChildrenSelected = false;
      }
    }
    if (subRow.subRows && subRow.subRows.length) {
      const subRowChildrenSelected = isSubRowSelected(subRow, selection);
      if (subRowChildrenSelected === "all") {
        someSelected = true;
      } else if (subRowChildrenSelected === "some") {
        someSelected = true;
        allChildrenSelected = false;
      } else {
        allChildrenSelected = false;
      }
    }
  });
  return allChildrenSelected ? "all" : someSelected ? "some" : false;
}
var reSplitAlphaNumeric = /([0-9]+)/gm;
var alphanumeric = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
var alphanumericCaseSensitive = (rowA, rowB, columnId) => {
  return compareAlphanumeric(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
var text = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)).toLowerCase(), toString(rowB.getValue(columnId)).toLowerCase());
};
var textCaseSensitive = (rowA, rowB, columnId) => {
  return compareBasic(toString(rowA.getValue(columnId)), toString(rowB.getValue(columnId)));
};
var datetime = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);
  return a > b ? 1 : a < b ? -1 : 0;
};
var basic = (rowA, rowB, columnId) => {
  return compareBasic(rowA.getValue(columnId), rowB.getValue(columnId));
};
function compareBasic(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function toString(a) {
  if (typeof a === "number") {
    if (isNaN(a) || a === Infinity || a === -Infinity) {
      return "";
    }
    return String(a);
  }
  if (typeof a === "string") {
    return a;
  }
  return "";
}
function compareAlphanumeric(aStr, bStr) {
  const a = aStr.split(reSplitAlphaNumeric).filter(Boolean);
  const b = bStr.split(reSplitAlphaNumeric).filter(Boolean);
  while (a.length && b.length) {
    const aa = a.shift();
    const bb = b.shift();
    const an = parseInt(aa, 10);
    const bn = parseInt(bb, 10);
    const combo = [an, bn].sort();
    if (isNaN(combo[0])) {
      if (aa > bb) {
        return 1;
      }
      if (bb > aa) {
        return -1;
      }
      continue;
    }
    if (isNaN(combo[1])) {
      return isNaN(an) ? -1 : 1;
    }
    if (an > bn) {
      return 1;
    }
    if (bn > an) {
      return -1;
    }
  }
  return a.length - b.length;
}
var sortingFns = {
  alphanumeric,
  alphanumericCaseSensitive,
  text,
  textCaseSensitive,
  datetime,
  basic
};
var RowSorting = {
  getInitialState: (state) => {
    return {
      sorting: [],
      ...state
    };
  },
  getDefaultColumnDef: () => {
    return {
      sortingFn: "auto",
      sortUndefined: 1
    };
  },
  getDefaultOptions: (table) => {
    return {
      onSortingChange: makeStateUpdater("sorting", table),
      isMultiSortEvent: (e) => {
        return e.shiftKey;
      }
    };
  },
  createColumn: (column, table) => {
    column.getAutoSortingFn = () => {
      const firstRows = table.getFilteredRowModel().flatRows.slice(10);
      let isString = false;
      for (const row of firstRows) {
        const value = row == null ? void 0 : row.getValue(column.id);
        if (Object.prototype.toString.call(value) === "[object Date]") {
          return sortingFns.datetime;
        }
        if (typeof value === "string") {
          isString = true;
          if (value.split(reSplitAlphaNumeric).length > 1) {
            return sortingFns.alphanumeric;
          }
        }
      }
      if (isString) {
        return sortingFns.text;
      }
      return sortingFns.basic;
    };
    column.getAutoSortDir = () => {
      const firstRow = table.getFilteredRowModel().flatRows[0];
      const value = firstRow == null ? void 0 : firstRow.getValue(column.id);
      if (typeof value === "string") {
        return "asc";
      }
      return "desc";
    };
    column.getSortingFn = () => {
      var _table$options$sortin, _table$options$sortin2;
      if (!column) {
        throw new Error();
      }
      return isFunction(column.columnDef.sortingFn) ? column.columnDef.sortingFn : column.columnDef.sortingFn === "auto" ? column.getAutoSortingFn() : (_table$options$sortin = (_table$options$sortin2 = table.options.sortingFns) == null ? void 0 : _table$options$sortin2[column.columnDef.sortingFn]) != null ? _table$options$sortin : sortingFns[column.columnDef.sortingFn];
    };
    column.toggleSorting = (desc, multi) => {
      const nextSortingOrder = column.getNextSortingOrder();
      const hasManualValue = typeof desc !== "undefined" && desc !== null;
      table.setSorting((old) => {
        const existingSorting = old == null ? void 0 : old.find((d) => d.id === column.id);
        const existingIndex = old == null ? void 0 : old.findIndex((d) => d.id === column.id);
        let newSorting = [];
        let sortAction;
        let nextDesc = hasManualValue ? desc : nextSortingOrder === "desc";
        if (old != null && old.length && column.getCanMultiSort() && multi) {
          if (existingSorting) {
            sortAction = "toggle";
          } else {
            sortAction = "add";
          }
        } else {
          if (old != null && old.length && existingIndex !== old.length - 1) {
            sortAction = "replace";
          } else if (existingSorting) {
            sortAction = "toggle";
          } else {
            sortAction = "replace";
          }
        }
        if (sortAction === "toggle") {
          if (!hasManualValue) {
            if (!nextSortingOrder) {
              sortAction = "remove";
            }
          }
        }
        if (sortAction === "add") {
          var _table$options$maxMul;
          newSorting = [...old, {
            id: column.id,
            desc: nextDesc
          }];
          newSorting.splice(0, newSorting.length - ((_table$options$maxMul = table.options.maxMultiSortColCount) != null ? _table$options$maxMul : Number.MAX_SAFE_INTEGER));
        } else if (sortAction === "toggle") {
          newSorting = old.map((d) => {
            if (d.id === column.id) {
              return {
                ...d,
                desc: nextDesc
              };
            }
            return d;
          });
        } else if (sortAction === "remove") {
          newSorting = old.filter((d) => d.id !== column.id);
        } else {
          newSorting = [{
            id: column.id,
            desc: nextDesc
          }];
        }
        return newSorting;
      });
    };
    column.getFirstSortDir = () => {
      var _ref, _column$columnDef$sor;
      const sortDescFirst = (_ref = (_column$columnDef$sor = column.columnDef.sortDescFirst) != null ? _column$columnDef$sor : table.options.sortDescFirst) != null ? _ref : column.getAutoSortDir() === "desc";
      return sortDescFirst ? "desc" : "asc";
    };
    column.getNextSortingOrder = (multi) => {
      var _table$options$enable, _table$options$enable2;
      const firstSortDirection = column.getFirstSortDir();
      const isSorted = column.getIsSorted();
      if (!isSorted) {
        return firstSortDirection;
      }
      if (isSorted !== firstSortDirection && ((_table$options$enable = table.options.enableSortingRemoval) != null ? _table$options$enable : true) && // If enableSortRemove, enable in general
      (multi ? (_table$options$enable2 = table.options.enableMultiRemove) != null ? _table$options$enable2 : true : true)) {
        return false;
      }
      return isSorted === "desc" ? "asc" : "desc";
    };
    column.getCanSort = () => {
      var _column$columnDef$ena, _table$options$enable3;
      return ((_column$columnDef$ena = column.columnDef.enableSorting) != null ? _column$columnDef$ena : true) && ((_table$options$enable3 = table.options.enableSorting) != null ? _table$options$enable3 : true) && !!column.accessorFn;
    };
    column.getCanMultiSort = () => {
      var _ref2, _column$columnDef$ena2;
      return (_ref2 = (_column$columnDef$ena2 = column.columnDef.enableMultiSort) != null ? _column$columnDef$ena2 : table.options.enableMultiSort) != null ? _ref2 : !!column.accessorFn;
    };
    column.getIsSorted = () => {
      var _table$getState$sorti;
      const columnSort = (_table$getState$sorti = table.getState().sorting) == null ? void 0 : _table$getState$sorti.find((d) => d.id === column.id);
      return !columnSort ? false : columnSort.desc ? "desc" : "asc";
    };
    column.getSortIndex = () => {
      var _table$getState$sorti2, _table$getState$sorti3;
      return (_table$getState$sorti2 = (_table$getState$sorti3 = table.getState().sorting) == null ? void 0 : _table$getState$sorti3.findIndex((d) => d.id === column.id)) != null ? _table$getState$sorti2 : -1;
    };
    column.clearSorting = () => {
      table.setSorting((old) => old != null && old.length ? old.filter((d) => d.id !== column.id) : []);
    };
    column.getToggleSortingHandler = () => {
      const canSort = column.getCanSort();
      return (e) => {
        if (!canSort) return;
        e.persist == null || e.persist();
        column.toggleSorting == null || column.toggleSorting(void 0, column.getCanMultiSort() ? table.options.isMultiSortEvent == null ? void 0 : table.options.isMultiSortEvent(e) : false);
      };
    };
  },
  createTable: (table) => {
    table.setSorting = (updater) => table.options.onSortingChange == null ? void 0 : table.options.onSortingChange(updater);
    table.resetSorting = (defaultState) => {
      var _table$initialState$s, _table$initialState;
      table.setSorting(defaultState ? [] : (_table$initialState$s = (_table$initialState = table.initialState) == null ? void 0 : _table$initialState.sorting) != null ? _table$initialState$s : []);
    };
    table.getPreSortedRowModel = () => table.getGroupedRowModel();
    table.getSortedRowModel = () => {
      if (!table._getSortedRowModel && table.options.getSortedRowModel) {
        table._getSortedRowModel = table.options.getSortedRowModel(table);
      }
      if (table.options.manualSorting || !table._getSortedRowModel) {
        return table.getPreSortedRowModel();
      }
      return table._getSortedRowModel();
    };
  }
};
var builtInFeatures = [
  Headers,
  ColumnVisibility,
  ColumnOrdering,
  ColumnPinning,
  ColumnFaceting,
  ColumnFiltering,
  GlobalFaceting,
  //depends on ColumnFaceting
  GlobalFiltering,
  //depends on ColumnFiltering
  RowSorting,
  ColumnGrouping,
  //depends on RowSorting
  RowExpanding,
  RowPagination,
  RowPinning,
  RowSelection,
  ColumnSizing
];
function createTable(options) {
  var _options$_features, _options$initialState;
  if (process.env.NODE_ENV !== "production" && (options.debugAll || options.debugTable)) {
    console.info("Creating Table Instance...");
  }
  const _features = [...builtInFeatures, ...(_options$_features = options._features) != null ? _options$_features : []];
  let table = {
    _features
  };
  const defaultOptions = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.getDefaultOptions == null ? void 0 : feature.getDefaultOptions(table));
  }, {});
  const mergeOptions = (options2) => {
    if (table.options.mergeOptions) {
      return table.options.mergeOptions(defaultOptions, options2);
    }
    return {
      ...defaultOptions,
      ...options2
    };
  };
  const coreInitialState = {};
  let initialState = {
    ...coreInitialState,
    ...(_options$initialState = options.initialState) != null ? _options$initialState : {}
  };
  table._features.forEach((feature) => {
    var _feature$getInitialSt;
    initialState = (_feature$getInitialSt = feature.getInitialState == null ? void 0 : feature.getInitialState(initialState)) != null ? _feature$getInitialSt : initialState;
  });
  const queued = [];
  let queuedTimeout = false;
  const coreInstance = {
    _features,
    options: {
      ...defaultOptions,
      ...options
    },
    initialState,
    _queue: (cb) => {
      queued.push(cb);
      if (!queuedTimeout) {
        queuedTimeout = true;
        Promise.resolve().then(() => {
          while (queued.length) {
            queued.shift()();
          }
          queuedTimeout = false;
        }).catch((error) => setTimeout(() => {
          throw error;
        }));
      }
    },
    reset: () => {
      table.setState(table.initialState);
    },
    setOptions: (updater) => {
      const newOptions = functionalUpdate(updater, table.options);
      table.options = mergeOptions(newOptions);
    },
    getState: () => {
      return table.options.state;
    },
    setState: (updater) => {
      table.options.onStateChange == null || table.options.onStateChange(updater);
    },
    _getRowId: (row, index, parent) => {
      var _table$options$getRow;
      return (_table$options$getRow = table.options.getRowId == null ? void 0 : table.options.getRowId(row, index, parent)) != null ? _table$options$getRow : `${parent ? [parent.id, index].join(".") : index}`;
    },
    getCoreRowModel: () => {
      if (!table._getCoreRowModel) {
        table._getCoreRowModel = table.options.getCoreRowModel(table);
      }
      return table._getCoreRowModel();
    },
    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up
    getRowModel: () => {
      return table.getPaginationRowModel();
    },
    //in next version, we should just pass in the row model as the optional 2nd arg
    getRow: (id, searchAll) => {
      let row = (searchAll ? table.getPrePaginationRowModel() : table.getRowModel()).rowsById[id];
      if (!row) {
        row = table.getCoreRowModel().rowsById[id];
        if (!row) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error(`getRow could not find row with ID: ${id}`);
          }
          throw new Error();
        }
      }
      return row;
    },
    _getDefaultColumnDef: memo2(() => [table.options.defaultColumn], (defaultColumn) => {
      var _defaultColumn;
      defaultColumn = (_defaultColumn = defaultColumn) != null ? _defaultColumn : {};
      return {
        header: (props) => {
          const resolvedColumnDef = props.header.column.columnDef;
          if (resolvedColumnDef.accessorKey) {
            return resolvedColumnDef.accessorKey;
          }
          if (resolvedColumnDef.accessorFn) {
            return resolvedColumnDef.id;
          }
          return null;
        },
        // footer: props => props.header.column.id,
        cell: (props) => {
          var _props$renderValue$to, _props$renderValue;
          return (_props$renderValue$to = (_props$renderValue = props.renderValue()) == null || _props$renderValue.toString == null ? void 0 : _props$renderValue.toString()) != null ? _props$renderValue$to : null;
        },
        ...table._features.reduce((obj, feature) => {
          return Object.assign(obj, feature.getDefaultColumnDef == null ? void 0 : feature.getDefaultColumnDef());
        }, {}),
        ...defaultColumn
      };
    }, getMemoOptions(options, "debugColumns", "_getDefaultColumnDef")),
    _getColumnDefs: () => table.options.columns,
    getAllColumns: memo2(() => [table._getColumnDefs()], (columnDefs) => {
      const recurseColumns = function(columnDefs2, parent, depth) {
        if (depth === void 0) {
          depth = 0;
        }
        return columnDefs2.map((columnDef) => {
          const column = createColumn(table, columnDef, depth, parent);
          const groupingColumnDef = columnDef;
          column.columns = groupingColumnDef.columns ? recurseColumns(groupingColumnDef.columns, column, depth + 1) : [];
          return column;
        });
      };
      return recurseColumns(columnDefs);
    }, getMemoOptions(options, "debugColumns", "getAllColumns")),
    getAllFlatColumns: memo2(() => [table.getAllColumns()], (allColumns) => {
      return allColumns.flatMap((column) => {
        return column.getFlatColumns();
      });
    }, getMemoOptions(options, "debugColumns", "getAllFlatColumns")),
    _getAllFlatColumnsById: memo2(() => [table.getAllFlatColumns()], (flatColumns) => {
      return flatColumns.reduce((acc, column) => {
        acc[column.id] = column;
        return acc;
      }, {});
    }, getMemoOptions(options, "debugColumns", "getAllFlatColumnsById")),
    getAllLeafColumns: memo2(() => [table.getAllColumns(), table._getOrderColumnsFn()], (allColumns, orderColumns2) => {
      let leafColumns = allColumns.flatMap((column) => column.getLeafColumns());
      return orderColumns2(leafColumns);
    }, getMemoOptions(options, "debugColumns", "getAllLeafColumns")),
    getColumn: (columnId) => {
      const column = table._getAllFlatColumnsById()[columnId];
      if (process.env.NODE_ENV !== "production" && !column) {
        console.error(`[Table] Column with id '${columnId}' does not exist.`);
      }
      return column;
    }
  };
  Object.assign(table, coreInstance);
  for (let index = 0; index < table._features.length; index++) {
    const feature = table._features[index];
    feature == null || feature.createTable == null || feature.createTable(table);
  }
  return table;
}
function getCoreRowModel() {
  return (table) => memo2(() => [table.options.data], (data) => {
    const rowModel = {
      rows: [],
      flatRows: [],
      rowsById: {}
    };
    const accessRows = function(originalRows, depth, parentRow) {
      if (depth === void 0) {
        depth = 0;
      }
      const rows = [];
      for (let i = 0; i < originalRows.length; i++) {
        const row = createRow(table, table._getRowId(originalRows[i], i, parentRow), originalRows[i], i, depth, void 0, parentRow == null ? void 0 : parentRow.id);
        rowModel.flatRows.push(row);
        rowModel.rowsById[row.id] = row;
        rows.push(row);
        if (table.options.getSubRows) {
          var _row$originalSubRows;
          row.originalSubRows = table.options.getSubRows(originalRows[i], i);
          if ((_row$originalSubRows = row.originalSubRows) != null && _row$originalSubRows.length) {
            row.subRows = accessRows(row.originalSubRows, depth + 1, row);
          }
        }
      }
      return rows;
    };
    rowModel.rows = accessRows(data);
    return rowModel;
  }, getMemoOptions(table.options, "debugTable", "getRowModel", () => table._autoResetPageIndex()));
}
function getSortedRowModel() {
  return (table) => memo2(() => [table.getState().sorting, table.getPreSortedRowModel()], (sorting, rowModel) => {
    if (!rowModel.rows.length || !(sorting != null && sorting.length)) {
      return rowModel;
    }
    const sortingState = table.getState().sorting;
    const sortedFlatRows = [];
    const availableSorting = sortingState.filter((sort) => {
      var _table$getColumn;
      return (_table$getColumn = table.getColumn(sort.id)) == null ? void 0 : _table$getColumn.getCanSort();
    });
    const columnInfoById = {};
    availableSorting.forEach((sortEntry) => {
      const column = table.getColumn(sortEntry.id);
      if (!column) return;
      columnInfoById[sortEntry.id] = {
        sortUndefined: column.columnDef.sortUndefined,
        invertSorting: column.columnDef.invertSorting,
        sortingFn: column.getSortingFn()
      };
    });
    const sortData = (rows) => {
      const sortedData = rows.map((row) => ({
        ...row
      }));
      sortedData.sort((rowA, rowB) => {
        for (let i = 0; i < availableSorting.length; i += 1) {
          var _sortEntry$desc;
          const sortEntry = availableSorting[i];
          const columnInfo = columnInfoById[sortEntry.id];
          const sortUndefined = columnInfo.sortUndefined;
          const isDesc = (_sortEntry$desc = sortEntry == null ? void 0 : sortEntry.desc) != null ? _sortEntry$desc : false;
          let sortInt = 0;
          if (sortUndefined) {
            const aValue = rowA.getValue(sortEntry.id);
            const bValue = rowB.getValue(sortEntry.id);
            const aUndefined = aValue === void 0;
            const bUndefined = bValue === void 0;
            if (aUndefined || bUndefined) {
              if (sortUndefined === "first") return aUndefined ? -1 : 1;
              if (sortUndefined === "last") return aUndefined ? 1 : -1;
              sortInt = aUndefined && bUndefined ? 0 : aUndefined ? sortUndefined : -sortUndefined;
            }
          }
          if (sortInt === 0) {
            sortInt = columnInfo.sortingFn(rowA, rowB, sortEntry.id);
          }
          if (sortInt !== 0) {
            if (isDesc) {
              sortInt *= -1;
            }
            if (columnInfo.invertSorting) {
              sortInt *= -1;
            }
            return sortInt;
          }
        }
        return rowA.index - rowB.index;
      });
      sortedData.forEach((row) => {
        var _row$subRows;
        sortedFlatRows.push(row);
        if ((_row$subRows = row.subRows) != null && _row$subRows.length) {
          row.subRows = sortData(row.subRows);
        }
      });
      return sortedData;
    };
    return {
      rows: sortData(rowModel.rows),
      flatRows: sortedFlatRows,
      rowsById: rowModel.rowsById
    };
  }, getMemoOptions(table.options, "debugTable", "getSortedRowModel", () => table._autoResetPageIndex()));
}

// ../../node_modules/@tanstack/react-table/build/lib/index.mjs
function flexRender(Comp, props) {
  return !Comp ? null : isReactComponent(Comp) ? /* @__PURE__ */ React.createElement(Comp, props) : Comp;
}
function isReactComponent(component) {
  return isClassComponent(component) || typeof component === "function" || isExoticComponent(component);
}
function isClassComponent(component) {
  return typeof component === "function" && (() => {
    const proto = Object.getPrototypeOf(component);
    return proto.prototype && proto.prototype.isReactComponent;
  })();
}
function isExoticComponent(component) {
  return typeof component === "object" && typeof component.$$typeof === "symbol" && ["react.memo", "react.forward_ref"].includes(component.$$typeof.description);
}
function useReactTable(options) {
  const resolvedOptions = {
    state: {},
    // Dummy state
    onStateChange: () => {
    },
    // noop
    renderFallbackValue: null,
    ...options
  };
  const [tableRef] = React.useState(() => ({
    current: createTable(resolvedOptions)
  }));
  const [state, setState] = React.useState(() => tableRef.current.initialState);
  tableRef.current.setOptions((prev) => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: (updater) => {
      setState(updater);
      options.onStateChange == null || options.onStateChange(updater);
    }
  }));
  return tableRef.current;
}

// src/table/Table.tsx
import { forwardRef as forwardRef21, useEffect, useState as useState2 } from "react";
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
  const [sorting, setSorting] = useState2([]);
  const [rowSelection, setRowSelection] = useState2({});
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
/*! Bundled license information:

@tanstack/table-core/build/lib/index.mjs:
  (**
     * table-core
     *
     * Copyright (c) TanStack
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.md file in the root directory of this source tree.
     *
     * @license MIT
     *)

@tanstack/react-table/build/lib/index.mjs:
  (**
     * react-table
     *
     * Copyright (c) TanStack
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.md file in the root directory of this source tree.
     *
     * @license MIT
     *)
*/
