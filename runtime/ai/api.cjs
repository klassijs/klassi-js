var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/identity.js"(exports2) {
    "use strict";
    var ALIAS = Symbol.for("yaml.alias");
    var DOC = Symbol.for("yaml.document");
    var MAP = Symbol.for("yaml.map");
    var PAIR = Symbol.for("yaml.pair");
    var SCALAR = Symbol.for("yaml.scalar");
    var SEQ = Symbol.for("yaml.seq");
    var NODE_TYPE = Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports2.ALIAS = ALIAS;
    exports2.DOC = DOC;
    exports2.MAP = MAP;
    exports2.NODE_TYPE = NODE_TYPE;
    exports2.PAIR = PAIR;
    exports2.SCALAR = SCALAR;
    exports2.SEQ = SEQ;
    exports2.hasAnchor = hasAnchor;
    exports2.isAlias = isAlias;
    exports2.isCollection = isCollection;
    exports2.isDocument = isDocument;
    exports2.isMap = isMap;
    exports2.isNode = isNode;
    exports2.isPair = isPair;
    exports2.isScalar = isScalar;
    exports2.isSeq = isSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/visit.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path8) {
      const ctrl = callVisitor(key, node, visitor, path8);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path8, ctrl);
        return visit_(key, ctrl, visitor, path8);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path8 = Object.freeze(path8.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path8);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path8 = Object.freeze(path8.concat(node));
          const ck = visit_("key", node.key, visitor, path8);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path8);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path8) {
      const ctrl = await callVisitor(key, node, visitor, path8);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path8, ctrl);
        return visitAsync_(key, ctrl, visitor, path8);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path8 = Object.freeze(path8.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path8);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path8 = Object.freeze(path8.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path8);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path8);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path8) {
      if (typeof visitor === "function")
        return visitor(key, node, path8);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path8);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path8);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path8);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path8);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path8);
      return void 0;
    }
    function replaceNode(key, path8, node) {
      const parent = path8[path8.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports2.visit = visit;
    exports2.visitAsync = visitAsync;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/directives.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid2 = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid2);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports2.Directives = Directives;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/anchors.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports2.anchorIsValid = anchorIsValid;
    exports2.anchorNames = anchorNames;
    exports2.createNodeAnchors = createNodeAnchors;
    exports2.findNewAnchor = findNewAnchor;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/applyReviver.js"(exports2) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports2.applyReviver = applyReviver;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/toJS.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports2.toJS = toJS;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Node.js"(exports2) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports2.NodeBase = NodeBase;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Alias.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const { anchors: anchors2, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        let data = anchors2.get(source);
        if (!data) {
          toJS.toJS(source, null, ctx);
          data = anchors2.get(source);
        }
        if (data?.res === void 0) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, source, anchors2);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
        return data.res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports2.Alias = Alias;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports2.Scalar = Scalar;
    exports2.isScalarValue = isScalarValue;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/createNode.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports2.createNode = createNode;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Collection.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path8, value) {
      let v = value;
      for (let i = path8.length - 1; i >= 0; --i) {
        const k = path8[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path8) => path8 == null || typeof path8 === "object" && !!path8[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path8, value) {
        if (isEmptyPath(path8))
          this.add(value);
        else {
          const [key, ...rest] = path8;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path8) {
        const [key, ...rest] = path8;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path8, keepScalar) {
        const [key, ...rest] = path8;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path8) {
        const [key, ...rest] = path8;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path8, value) {
        const [key, ...rest] = path8;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports2.Collection = Collection;
    exports2.collectionFromPath = collectionFromPath;
    exports2.isEmptyPath = isEmptyPath;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyComment.js"(exports2) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports2.indentComment = indentComment;
    exports2.lineComment = lineComment;
    exports2.stringifyComment = stringifyComment;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/foldFlowLines.js"(exports2) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports2.FOLD_BLOCK = FOLD_BLOCK;
    exports2.FOLD_FLOW = FOLD_FLOW;
    exports2.FOLD_QUOTED = FOLD_QUOTED;
    exports2.foldFlowLines = foldFlowLines;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyString.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str += "\n";
                  i += 2;
                }
                str += indent;
                if (json[i + 2] === " ")
                  str += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test2 = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test2) || compat?.some(test2))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports2.stringifyString = stringifyString;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringify.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports2.createStringifyContext = createStringifyContext;
    exports2.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyPair.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports2.stringifyPair = stringifyPair;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/log.js"(exports2) {
    "use strict";
    var node_process = require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports2.debug = debug;
    exports2.warn = warn;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports2.addMergeToJSMap = addMergeToJSMap;
    exports2.isMergeKey = isMergeKey;
    exports2.merge = merge;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports2) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports2.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Pair.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports2.Pair = Pair;
    exports2.createPair = createPair;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyCollection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
        if (i < items.length - 1) {
          str += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str += ",";
          }
        }
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports2.stringifyCollection = stringifyCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/YAMLMap.js"(exports2) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports2.YAMLMap = YAMLMap;
    exports2.findPair = findPair;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/map.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports2.map = map;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/YAMLSeq.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports2.YAMLSeq = YAMLSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/seq.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports2.seq = seq;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/string.js"(exports2) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports2.string = string;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/null.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports2.nullTag = nullTag;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports2.boolTag = boolTag;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyNumber.js"(exports2) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports2.stringifyNumber = stringifyNumber;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports2.schema = schema;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/json/schema.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports2.schema = schema;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports2) {
    "use strict";
    var node_buffer = require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i = 0; i < str.length; ++i)
            buffer[i] = str.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports2.binary = binary;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports2.createPairs = createPairs;
    exports2.pairs = pairs;
    exports2.resolvePairs = resolvePairs;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports2.YAMLOMap = YAMLOMap;
    exports2.omap = omap;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports2.falseTag = falseTag;
    exports2.trueTag = trueTag;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intBin = intBin;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports2.YAMLSet = YAMLSet;
    exports2.set = set;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n) => n;
      if (typeof value === "bigint")
        num = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports2.floatTime = floatTime;
    exports2.intTime = intTime;
    exports2.timestamp = timestamp;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports2.schema = schema;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/tags.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports2.coreKnownTags = coreKnownTags;
    exports2.getTags = getTags;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/Schema.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports2.Schema = Schema;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyDocument.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports2.stringifyDocument = stringifyDocument;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/Document.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path8, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path8, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path8) {
        if (Collection.isEmptyPath(path8)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path8) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path8, keepScalar) {
        if (Collection.isEmptyPath(path8))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path8, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path8) {
        if (Collection.isEmptyPath(path8))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path8) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path8, value) {
        if (Collection.isEmptyPath(path8)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path8), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path8, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports2.Document = Document;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/errors.js"(exports2) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports2.YAMLError = YAMLError;
    exports2.YAMLParseError = YAMLParseError;
    exports2.YAMLWarning = YAMLWarning;
    exports2.prettifyError = prettifyError;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-props.js"(exports2) {
    "use strict";
    function resolveProps(tokens2, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens2) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens2[tokens2.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports2.resolveProps = resolveProps;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-contains-newline.js"(exports2) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports2.containsNewline = containsNewline;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports2) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports2.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-map-includes.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports2.mapIncludes = mapIncludes;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-map.js"(exports2) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports2.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-seq.js"(exports2) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports2.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-end.js"(exports2) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports2.resolveEnd = resolveEnd;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports2.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports2.composeCollection = composeCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports2.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
      let first, line;
      try {
        first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
        line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
      } catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
      }
      let match = first.exec(source);
      if (!match)
        return source;
      let res = match[1];
      let sep = " ";
      let pos = first.lastIndex;
      line.lastIndex = pos;
      while (match = line.exec(source)) {
        if (match[1] === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + match[1];
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports2.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports2.composeScalar = composeScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports2) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports2.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-node.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports2.composeEmptyNode = composeEmptyNode;
    exports2.composeNode = composeNode;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-doc.js"(exports2) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports2.composeDoc = composeDoc;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/composer.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i = 0; i < this.errors.length; ++i)
            doc.errors.push(this.errors[i]);
          for (let i = 0; i < this.warnings.length; ++i)
            doc.warnings.push(this.warnings[i]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens2, forceDoc = false, endOffset = -1) {
        for (const token of tokens2)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports2.Composer = Composer;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-scalar.js"(exports2) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports2.createScalarToken = createScalarToken;
    exports2.resolveAsScalar = resolveAsScalar;
    exports2.setScalarValue = setScalarValue;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-stringify.js"(exports2) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports2.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-visit.js"(exports2) {
    "use strict";
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path8) => {
      let item = cst;
      for (const [field, index] of path8) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path8) => {
      const parent = visit.itemAtPath(cst, path8.slice(0, -1));
      const field = path8[path8.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path8, item, visitor) {
      let ctrl = visitor(item, path8);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path8.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path8);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path8) : ctrl;
    }
    exports2.visit = visit;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst.js"(exports2) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports2.createScalarToken = cstScalar.createScalarToken;
    exports2.resolveAsScalar = cstScalar.resolveAsScalar;
    exports2.setScalarValue = cstScalar.setScalarValue;
    exports2.stringify = cstStringify.stringify;
    exports2.visit = cstVisit.visit;
    exports2.BOM = BOM;
    exports2.DOCUMENT = DOCUMENT;
    exports2.FLOW_END = FLOW_END;
    exports2.SCALAR = SCALAR;
    exports2.isCollection = isCollection;
    exports2.isScalar = isScalar;
    exports2.prettyToken = prettyToken;
    exports2.tokenType = tokenType;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/lexer.js"(exports2) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test2) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test2(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports2.Lexer = Lexer;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/line-counter.js"(exports2) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports2.LineCounter = LineCounter;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/parser.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i = 0; i < source.length; ++i)
          target.push(source[i]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs2 = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs2, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs2);
              } else {
                Object.assign(it, { key: fs2, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs2 = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs2, sep: [] });
              else if (it.sep)
                this.stack.push(fs2);
              else
                Object.assign(it, { key: fs2, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports2.Parser = Parser;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/public-api.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse2(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports2.parse = parse2;
    exports2.parseAllDocuments = parseAllDocuments;
    exports2.parseDocument = parseDocument;
    exports2.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/index.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports2.Composer = composer.Composer;
    exports2.Document = Document.Document;
    exports2.Schema = Schema.Schema;
    exports2.YAMLError = errors.YAMLError;
    exports2.YAMLParseError = errors.YAMLParseError;
    exports2.YAMLWarning = errors.YAMLWarning;
    exports2.Alias = Alias.Alias;
    exports2.isAlias = identity.isAlias;
    exports2.isCollection = identity.isCollection;
    exports2.isDocument = identity.isDocument;
    exports2.isMap = identity.isMap;
    exports2.isNode = identity.isNode;
    exports2.isPair = identity.isPair;
    exports2.isScalar = identity.isScalar;
    exports2.isSeq = identity.isSeq;
    exports2.Pair = Pair.Pair;
    exports2.Scalar = Scalar.Scalar;
    exports2.YAMLMap = YAMLMap.YAMLMap;
    exports2.YAMLSeq = YAMLSeq.YAMLSeq;
    exports2.CST = cst;
    exports2.Lexer = lexer.Lexer;
    exports2.LineCounter = lineCounter.LineCounter;
    exports2.Parser = parser.Parser;
    exports2.parse = publicApi.parse;
    exports2.parseAllDocuments = publicApi.parseAllDocuments;
    exports2.parseDocument = publicApi.parseDocument;
    exports2.stringify = publicApi.stringify;
    exports2.visit = visit.visit;
    exports2.visitAsync = visit.visitAsync;
  }
});

// packages/ai-artefacts/dist/locatorBind.js
function harvestInteractiveNodes(html) {
  const navKeys = new Set(navSections(html).flatMap((section) => readNodes(section).filter((node) => node.tag === "a").map(navKey)));
  return readNodes(html).map((node) => node.tag === "a" ? { ...node, inNav: navKeys.has(navKey(node)) } : node);
}
function readNodes(html) {
  const nodes = [];
  const tagRe = /<(input|button|select|textarea|a|label|h1|h2|h3|img|article)\b([^>]*)>(?:([^<]*))?/gi;
  let match = tagRe.exec(html);
  while (match) {
    const attrs = match[2] ?? "";
    const text = String(match[3] || attr(attrs, "alt") || attr(attrs, "value") || attr(attrs, "placeholder") || "").replace(/\s+/g, " ").trim();
    nodes.push({
      tag: match[1]?.toLowerCase(),
      testid: attr(attrs, "data-testid"),
      name: attr(attrs, "name"),
      id: attr(attrs, "id"),
      className: attr(attrs, "class"),
      aria: attr(attrs, "aria-label"),
      alt: attr(attrs, "alt"),
      text: text || void 0,
      href: match[1]?.toLowerCase() === "a" ? attr(attrs, "href") : void 0
    });
    match = tagRe.exec(html);
  }
  return nodes.filter((node) => node.testid || node.name || node.id || node.className || node.aria || node.text || node.href);
}
function navSections(html) {
  const sections = [];
  const named = /<(nav|header)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match = named.exec(html);
  while (match) {
    sections.push(match[2] || "");
    match = named.exec(html);
  }
  const role = /<[^>]+role=["']navigation["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi;
  match = role.exec(html);
  while (match) {
    sections.push(match[1] || "");
    match = role.exec(html);
  }
  return sections;
}
function navKey(node) {
  return `${String(node.href || "").trim().toLowerCase()}|${String(node.text || "").trim().toLowerCase()}`;
}
function bindCasesToNodes(cases, nodes) {
  return cases.map((testCase) => ({
    ...testCase,
    steps: testCase.steps.map((step) => bindStep(step, nodes))
  }));
}
function resolveProductUrl(pageUrl, env = process.env) {
  const raw = String(pageUrl || env.PRODUCT_START_PATH || "/").trim();
  if (/^https?:\/\//i.test(raw))
    return raw;
  const base = String(env.PRODUCT_BASE_URL || "").replace(/\/+$/, "");
  if (!base)
    return null;
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}
async function loginProduct(env, fetchImpl = fetch) {
  const loginUrl = String(env.PRODUCT_LOGIN_URL || "").trim();
  const user = String(env.PRODUCT_USER || "").trim();
  const password = String(env.PRODUCT_PASSWORD || "").trim();
  if (!loginUrl || !user || !password)
    return "";
  const response = await fetchImpl(loginUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: user, email: user, password }).toString(),
    redirect: "manual"
  });
  return cookieHeader(response);
}
async function fetchProductHtml(url, cookie, fetchImpl = fetch) {
  const response = await fetchImpl(url, { headers: cookie ? { cookie } : void 0 });
  if (!response.ok) {
    throw new Error(`Product page returned HTTP ${response.status}`);
  }
  return response.text();
}
function bindStep(step, nodes) {
  if (step.api)
    return step;
  const needle = normalize(step.target?.find.value || "");
  if (!needle)
    return step;
  const hit = nodes.map((node) => ({ node, score: matchScore(node, needle) })).filter((item) => item.score > 0).sort((left, right) => right.score - left.score)[0]?.node;
  if (!hit) {
    if (step.target?.find.fromDom === false) {
      return { ...step, target: { ...step.target, find: { by: "text", value: "", fromDom: false } } };
    }
    return step;
  }
  const find = findFromNode(hit);
  if (!find)
    return step;
  const target = {
    name: step.target?.name || "element",
    type: step.target?.type || (hit.tag === "input" || hit.tag === "textarea" || hit.tag === "select" ? "input" : "button"),
    find: { ...find, fromDom: true }
  };
  return { ...step, target };
}
function findFromNode(node) {
  const id = String(node.id || "").trim();
  if (node.testid)
    return { by: "testid", value: node.testid };
  if (id)
    return { by: "id", value: id };
  const name = String(node.name || "").trim();
  if (name)
    return { by: "name", value: name };
  const className = usefulClass(node.className);
  if (className)
    return { by: "class", value: className };
  if (node.tag === "a") {
    const link = String(node.text || "").replace(/\s+/g, " ").trim();
    if (link && link.length > 40)
      return { by: "partialLink", value: link.slice(0, 24).trim() };
    if (link)
      return { by: "link", value: link };
  }
  const css = cssFromNode(node);
  if (css)
    return { by: "css", value: css };
  const xpath = xpathFromNode(node);
  if (xpath)
    return { by: "xpath", value: xpath };
  if (node.tag && !GENERIC_TAGS.has(node.tag))
    return { by: "tag", value: node.tag };
  return null;
}
function usefulClass(className) {
  return String(className || "").split(/\s+/).map((item) => item.trim()).find((item) => item.length > 1 && !UTILITY_CLASS.test(item) && !/[:/]/.test(item));
}
function cssFromNode(node) {
  const alt = node.alt || (node.tag === "img" ? node.text : void 0);
  if (node.tag === "img" && alt)
    return `img[alt="${escapeAttr2(alt)}"]`;
  if (node.tag && /^h[1-6]$/.test(node.tag) && node.text) {
    const plain = node.text.replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();
    return plain !== node.text ? `${node.tag}*=${plain}` : `${node.tag}=${node.text}`;
  }
  if (node.aria)
    return `[aria-label="${escapeAttr2(node.aria)}"]`;
  if (node.tag === "a" && node.href && !/^https?:\/\//i.test(node.href) && node.href !== "#") {
    return `a[href="${escapeAttr2(node.href)}"]`;
  }
  return void 0;
}
function xpathFromNode(node) {
  const text = String(node.text || "").replace(/\s+/g, " ").trim();
  const tag = node.tag || "*";
  if (text) {
    const plain = text.replace(/[™®©]/g, "").replace(/"/g, "");
    if (plain !== text)
      return `//${tag}[contains(normalize-space(), "${escapeAttr2(plain)}")]`;
    return `//${tag}[normalize-space()="${escapeAttr2(text)}"]`;
  }
  if (node.alt)
    return `//${tag}[@alt="${escapeAttr2(node.alt)}"]`;
  if (node.href)
    return `//${tag}[@href="${escapeAttr2(node.href)}"]`;
  return void 0;
}
function matchScore(node, needle) {
  const fields = [node.testid, node.aria, node.alt, node.text, node.name, node.id, node.className].map(normalize).filter(Boolean);
  if (fields.includes(normalize(needle)))
    return 4;
  const wanted = contentTokens(needle);
  const role = tokens(needle).find((token) => Boolean(ROLE_TAGS[token]));
  let score2 = 0;
  if (wanted.length > 0 && fields.some((field) => wanted.every((token) => tokens(field).includes(token) || field.includes(token)))) {
    score2 += 2;
  } else if (wanted.length > 0 && fields.some((field) => wanted.some((token) => field.includes(token)))) {
    score2 += 1;
  }
  if (role && ROLE_TAGS[role].includes(node.tag || "")) {
    score2 += 1;
  }
  return score2;
}
function normalize(value) {
  return String(value || "").trim().toLowerCase();
}
function contentTokens(value) {
  return tokens(value).filter((token) => !ROLE_TAGS[token]);
}
function tokens(value) {
  return normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 1 && !STOP.has(token));
}
function escapeAttr2(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function attr(attrs, name) {
  const match = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match?.[1];
}
function cookieHeader(response) {
  const many = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  if (many.length > 0) {
    return many.map((item) => item.split(";", 1)[0]).filter(Boolean).join("; ");
  }
  const single = response.headers.get("set-cookie");
  return single ? single.split(";", 1)[0] : "";
}
var GENERIC_TAGS, UTILITY_CLASS, STOP, ROLE_TAGS;
var init_locatorBind = __esm({
  "packages/ai-artefacts/dist/locatorBind.js"() {
    "use strict";
    GENERIC_TAGS = /* @__PURE__ */ new Set(["a", "div", "span", "p", "li", "ul", "section", "article", "img", "svg", "label"]);
    UTILITY_CLASS = /^(text-|mb-|mt-|ml-|mr-|ms-|me-|p-|px-|py-|pt-|pb-|pl-|pr-|d-|col-|row-|w-|h-|flex|justify-|align-|container$|col$|row$|show$|hide$|active$|collapsed$)/i;
    STOP = /* @__PURE__ */ new Set(["the", "a", "an", "is", "are", "and", "of", "for"]);
    ROLE_TAGS = {
      logo: ["img", "svg"],
      heading: ["h1", "h2", "h3", "h4"],
      title: ["h1", "h2"],
      card: ["article", "h3", "section", "img"],
      image: ["img", "svg"],
      button: ["button"],
      link: ["a"]
    };
  }
});

// packages/ai-artefacts/dist/outlineExamples.js
function headingFromNodes(nodes) {
  const heading = nodes.find((node) => node.tag === "h1" && node.text) || nodes.find((node) => node.tag === "h2" && node.text);
  return String(heading?.text || "").replace(/\s+/g, " ").trim();
}
function navLinksFromNodes(nodes) {
  const links = nodes.filter(isMenuLink);
  const inMenu = links.filter((node) => node.inNav);
  const chosen = inMenu.length > 0 ? inMenu : links;
  const seen = /* @__PURE__ */ new Set();
  const unique = [];
  for (const node of chosen) {
    const key = `${normalize2(node.text)}|${normalizeHref(node.href)}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    unique.push(node);
    if (unique.length >= MAX_NAV)
      break;
  }
  return unique;
}
function extraNavUrls(nodes, homeUrls) {
  const home = homeUrls[0] || "";
  const known = new Set(homeUrls.map(normalizeHref).filter(Boolean));
  const extras = [];
  for (const link of navLinksFromNodes(nodes)) {
    const href = resolveHref(link.href || "", home);
    if (!href || known.has(normalizeHref(href)))
      continue;
    if (home && !sameOrigin(href, home))
      continue;
    extras.push(href);
    known.add(normalizeHref(href));
  }
  return extras;
}
function navRowsFromNodes(nodes, homeUrl) {
  return navLinksFromNodes(nodes).map((link) => {
    const name = String(link.text || "").replace(/\s+/g, " ").trim();
    const href = resolveHref(link.href || "", homeUrl);
    return {
      navigation_link: name,
      page_name: name,
      main_heading: headingFor(nodes, href, homeUrl) || name,
      href
    };
  });
}
function resolveHref(href, base) {
  const raw = String(href || "").trim();
  if (!raw)
    return "";
  try {
    return new URL(raw, base || "https://example.invalid/").toString();
  } catch {
    return raw;
  }
}
function mergeDomExamples(current, next) {
  if (!hasDummyExampleCells(current))
    return current;
  const tables = [...next.matchAll(/[ \t]*Examples:\n(?:[ \t]*\|.+\|\n)+/g)].map((match) => match[0]);
  if (tables.length === 0 || tables.every((table) => hasDummyExampleCells(table)))
    return current;
  let index = 0;
  return current.replace(/[ \t]*Examples:\n(?:[ \t]*\|.+\|\n)+/g, (block) => {
    if (!hasDummyExampleCells(block))
      return block;
    return tables[index++] || block;
  });
}
function hasDummyExampleCells(text) {
  return /\|\s*example\d+\s*\|/i.test(text);
}
function normalizeHref(value) {
  return String(value || "").trim().replace(/\/+$/, "").toLowerCase();
}
function headingFor(nodes, href, homeUrl) {
  const dest = normalizeHref(href);
  const home = normalizeHref(homeUrl);
  const scoped = nodes.filter((node) => node.pageUrl && normalizeHref(node.pageUrl) === dest);
  if (scoped.length > 0)
    return headingFromNodes(scoped);
  if (dest && dest === home)
    return headingFromNodes(nodes.filter((node) => !node.pageUrl || normalizeHref(node.pageUrl) === home));
  return "";
}
function isMenuLink(node) {
  if (node.tag !== "a")
    return false;
  const text = String(node.text || "").replace(/\s+/g, " ").trim();
  const href = String(node.href || "").trim();
  if (!text || text.length > 48)
    return false;
  if (SKIP_LINK.test(text) || /logo/i.test(text))
    return false;
  if (SKIP_HREF.test(href) || href === "#" || href.startsWith("#") || href.startsWith("?"))
    return false;
  return Boolean(href || node.inNav);
}
function sameOrigin(url, base) {
  try {
    return new URL(url).origin === new URL(base).origin;
  } catch {
    return false;
  }
}
function normalize2(value) {
  return String(value || "").trim().toLowerCase();
}
var MAX_NAV, SKIP_LINK, SKIP_HREF;
var init_outlineExamples = __esm({
  "packages/ai-artefacts/dist/outlineExamples.js"() {
    "use strict";
    MAX_NAV = 8;
    SKIP_LINK = /^(skip|cookie|privacy|terms|login|log in|sign in|sign up|register|twitter|x|linkedin|facebook|instagram|youtube|github|email|mail|rss)$/i;
    SKIP_HREF = /^(mailto:|tel:|javascript:)/i;
  }
});

// packages/ai-artefacts/dist/browserHarvest.js
var browserHarvest_exports = {};
__export(browserHarvest_exports, {
  harvestProductWithBrowser: () => harvestProductWithBrowser,
  harvestRenderedNodes: () => harvestRenderedNodes,
  nodesFromHtml: () => nodesFromHtml,
  startChrome: () => startChrome
});
function collectVisibleNodes() {
  const nodes = [];
  const seen = /* @__PURE__ */ new Set();
  const root = globalThis;
  const list = root.document.querySelectorAll("a,button,input,select,textarea,label,h1,h2,h3,h4,img,article,svg,[role],[data-testid],[aria-label],[alt],[title]");
  for (const el of list) {
    const alt = el.getAttribute("alt") || void 0;
    const href = el.getAttribute("href") || void 0;
    const text = String(alt || el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").replace(/\s+/g, " ").trim();
    const closest = el.closest;
    const node = {
      tag: String(el.tagName || "").toLowerCase(),
      testid: el.getAttribute("data-testid") || void 0,
      name: el.getAttribute("name") || void 0,
      id: el.id || void 0,
      className: el.getAttribute("class") || void 0,
      aria: el.getAttribute("aria-label") || void 0,
      alt,
      text: text || void 0,
      href,
      inNav: Boolean(closest?.call(el, 'nav, header, [role="navigation"]'))
    };
    const key = [node.tag, node.testid, node.name, node.id, node.className, node.aria, node.text].join("|");
    if (seen.has(key) || !(node.testid || node.name || node.id || node.className || node.aria || node.text || node.href))
      continue;
    seen.add(key);
    nodes.push(node);
  }
  return nodes;
}
async function harvestRenderedNodes(browser) {
  const nodes = await browser.execute(collectVisibleNodes);
  return Array.isArray(nodes) ? nodes.filter((node) => node && (node.testid || node.name || node.id || node.aria || node.text)) : [];
}
async function harvestProductWithBrowser(urls, options = {}) {
  const env = options.env ?? process.env;
  const timeoutMs = options.timeoutMs ?? Number(env.PRODUCT_BIND_TIMEOUT_MS || 2e4);
  const browser = options.openBrowser ? await options.openBrowser(env) : await startChrome(env);
  const nodes = [];
  try {
    await loginInBrowser(browser, env);
    for (const url of urls) {
      await browser.url(url);
      await waitForPage(browser, timeoutMs);
      nodes.push(...(await harvestRenderedNodes(browser)).map((node) => ({ ...node, pageUrl: url })));
    }
    if (options.followNav) {
      for (const extra of extraNavUrls(nodes, urls)) {
        await browser.url(extra);
        await waitForPage(browser, timeoutMs);
        nodes.push(...(await harvestRenderedNodes(browser)).map((node) => ({ ...node, pageUrl: extra })));
      }
    }
  } finally {
    if (browser.deleteSession) {
      await browser.deleteSession().catch(() => void 0);
    }
  }
  return nodes;
}
async function startChrome(env = process.env) {
  const { remote } = await import("webdriverio");
  const chromeOptions = {
    args: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--window-size=1280,1024"]
  };
  if (env.CHROME_BINARY) {
    chromeOptions.binary = env.CHROME_BINARY;
  }
  return await remote({
    logLevel: "error",
    capabilities: {
      browserName: "chrome",
      "goog:chromeOptions": chromeOptions
    }
  });
}
async function loginInBrowser(browser, env) {
  const loginUrl = String(env.PRODUCT_LOGIN_URL || "").trim();
  const user = String(env.PRODUCT_USER || "").trim();
  const password = String(env.PRODUCT_PASSWORD || "").trim();
  if (!loginUrl || !user || !password || !browser.$)
    return;
  await browser.url(loginUrl);
  await waitForPage(browser, Number(env.PRODUCT_BIND_TIMEOUT_MS || 2e4));
  const userField = await firstExisting(browser, ['input[type="email"]', 'input[name="email"]', 'input[name="username"]', 'input[type="text"]']);
  const passField = await firstExisting(browser, ['input[type="password"]']);
  if (userField)
    await userField.setValue(user);
  if (passField)
    await passField.setValue(password);
  const submit = await firstExisting(browser, ['button[type="submit"]', 'input[type="submit"]', "button"]);
  if (submit)
    await submit.click();
  await waitForPage(browser, Number(env.PRODUCT_BIND_TIMEOUT_MS || 2e4));
}
async function firstExisting(browser, selectors) {
  if (!browser.$)
    return null;
  for (const selector of selectors) {
    const element = await browser.$(selector);
    if (await element.isExisting())
      return element;
  }
  return null;
}
async function waitForPage(browser, timeoutMs) {
  if (browser.waitUntil) {
    await browser.waitUntil(async () => {
      const state = await browser.execute(() => globalThis.document?.readyState);
      return state === "complete";
    }, { timeout: timeoutMs });
    await browser.waitUntil(async () => {
      return browser.execute(() => Boolean(globalThis.document?.querySelector?.("h1, img[alt], [data-testid], [aria-label]")));
    }, { timeout: Math.min(8e3, timeoutMs) }).catch(() => void 0);
  }
  if (browser.pause) {
    await browser.pause(400);
  }
}
function nodesFromHtml(html) {
  return harvestInteractiveNodes(html);
}
var init_browserHarvest = __esm({
  "packages/ai-artefacts/dist/browserHarvest.js"() {
    "use strict";
    init_locatorBind();
    init_outlineExamples();
  }
});

// scripts/ai-public-entry.mjs
var ai_public_entry_exports = {};
__export(ai_public_entry_exports, {
  AI_PUBLIC_API_VERSION: () => AI_PUBLIC_API_VERSION,
  FakeAIAdapter: () => FakeAIAdapter,
  aiCase: () => aiCase,
  aiSuite: () => aiSuite,
  createAdapterRegistry: () => createAdapterRegistry,
  execute: () => execute,
  runAiEvaluation: () => runAiEvaluation
});
module.exports = __toCommonJS(ai_public_entry_exports);

// packages/ai-cli/dist/cli.js
var import_promises6 = require("node:fs/promises");
var import_node_path7 = __toESM(require("node:path"), 1);

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/lib/error.js
var CommanderError = class extends Error {
  /**
   * Constructs the CommanderError class
   * @param {number} exitCode suggested exit code which could be used with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   */
  constructor(exitCode, code, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = void 0;
  }
};
var InvalidArgumentError = class extends CommanderError {
  /**
   * Constructs the InvalidArgumentError class
   * @param {string} [message] explanation of why argument is invalid
   */
  constructor(message) {
    super(1, "commander.invalidArgument", message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
};

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/lib/argument.js
var Argument = class {
  /**
   * Initialize a new command argument with the given name and description.
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @param {string} name
   * @param {string} [description]
   */
  constructor(name, description) {
    this.description = description || "";
    this.variadic = false;
    this.parseArg = void 0;
    this.defaultValue = void 0;
    this.defaultValueDescription = void 0;
    this.argChoices = void 0;
    switch (name[0]) {
      case "<":
        this.required = true;
        this._name = name.slice(1, -1);
        break;
      case "[":
        this.required = false;
        this._name = name.slice(1, -1);
        break;
      default:
        this.required = true;
        this._name = name;
        break;
    }
    if (this._name.endsWith("...")) {
      this.variadic = true;
      this._name = this._name.slice(0, -3);
    }
  }
  /**
   * Return argument name.
   *
   * @return {string}
   */
  name() {
    return this._name;
  }
  /**
   * @package
   */
  _collectValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }
    previous.push(value);
    return previous;
  }
  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Argument}
   */
  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }
  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */
  argParser(fn) {
    this.parseArg = fn;
    return this;
  }
  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */
  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${this.argChoices.join(", ")}.`
        );
      }
      if (this.variadic) {
        return this._collectValue(arg, previous);
      }
      return arg;
    };
    return this;
  }
  /**
   * Make argument required.
   *
   * @returns {Argument}
   */
  argRequired() {
    this.required = true;
    return this;
  }
  /**
   * Make argument optional.
   *
   * @returns {Argument}
   */
  argOptional() {
    this.required = false;
    return this;
  }
};
function humanReadableArgName(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
  return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
}

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/lib/command.js
var import_node_events = require("node:events");
var import_node_child_process = __toESM(require("node:child_process"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_process = __toESM(require("node:process"), 1);
var import_node_util2 = require("node:util");

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/lib/help.js
var import_node_util = require("node:util");
var Help = class {
  constructor() {
    this.helpWidth = void 0;
    this.minWidthToWrap = 40;
    this.sortSubcommands = false;
    this.sortOptions = false;
    this.showGlobalOptions = false;
  }
  /**
   * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
   * and just before calling `formatHelp()`.
   *
   * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
   *
   * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
   */
  prepareContext(contextOptions) {
    this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
  }
  /**
   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
   *
   * @param {Command} cmd
   * @returns {Command[]}
   */
  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
    const helpCommand = cmd._getHelpCommand();
    if (helpCommand && !helpCommand._hidden) {
      visibleCommands.push(helpCommand);
    }
    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        return a.name().localeCompare(b.name());
      });
    }
    return visibleCommands;
  }
  /**
   * Compare options for sort.
   *
   * @param {Option} a
   * @param {Option} b
   * @returns {number}
   */
  compareOptions(a, b) {
    const getSortKey = (option) => {
      return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
    };
    return getSortKey(a).localeCompare(getSortKey(b));
  }
  /**
   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */
  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden);
    const helpOption = cmd._getHelpOption();
    if (helpOption && !helpOption.hidden) {
      const removeShort = helpOption.short && cmd._findOption(helpOption.short);
      const removeLong = helpOption.long && cmd._findOption(helpOption.long);
      if (!removeShort && !removeLong) {
        visibleOptions.push(helpOption);
      } else if (helpOption.long && !removeLong) {
        visibleOptions.push(
          cmd.createOption(helpOption.long, helpOption.description)
        );
      } else if (helpOption.short && !removeShort) {
        visibleOptions.push(
          cmd.createOption(helpOption.short, helpOption.description)
        );
      }
    }
    if (this.sortOptions) {
      visibleOptions.sort(this.compareOptions);
    }
    return visibleOptions;
  }
  /**
   * Get an array of the visible global options. (Not including help.)
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */
  visibleGlobalOptions(cmd) {
    if (!this.showGlobalOptions) return [];
    const globalOptions = [];
    for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
      const visibleOptions = ancestorCmd.options.filter(
        (option) => !option.hidden
      );
      globalOptions.push(...visibleOptions);
    }
    if (this.sortOptions) {
      globalOptions.sort(this.compareOptions);
    }
    return globalOptions;
  }
  /**
   * Get an array of the arguments if any have a description.
   *
   * @param {Command} cmd
   * @returns {Argument[]}
   */
  visibleArguments(cmd) {
    if (cmd._argsDescription) {
      cmd.registeredArguments.forEach((argument) => {
        argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
      });
    }
    if (cmd.registeredArguments.find((argument) => argument.description)) {
      return cmd.registeredArguments;
    }
    return [];
  }
  /**
   * Get the command term to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */
  subcommandTerm(cmd) {
    const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
    return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
    (args ? " " + args : "");
  }
  /**
   * Get the option term to show in the list of options.
   *
   * @param {Option} option
   * @returns {string}
   */
  optionTerm(option) {
    return option.flags;
  }
  /**
   * Get the argument term to show in the list of arguments.
   *
   * @param {Argument} argument
   * @returns {string}
   */
  argumentTerm(argument) {
    return argument.name();
  }
  /**
   * Get the longest command term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(
        max,
        this.displayWidth(
          helper.styleSubcommandTerm(helper.subcommandTerm(command))
        )
      );
    }, 0);
  }
  /**
   * Get the longest option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(
        max,
        this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
      );
    }, 0);
  }
  /**
   * Get the longest global option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestGlobalOptionTermLength(cmd, helper) {
    return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
      return Math.max(
        max,
        this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
      );
    }, 0);
  }
  /**
   * Get the longest argument term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(
        max,
        this.displayWidth(
          helper.styleArgumentTerm(helper.argumentTerm(argument))
        )
      );
    }, 0);
  }
  /**
   * Get the command usage to be displayed at the top of the built-in help.
   *
   * @param {Command} cmd
   * @returns {string}
   */
  commandUsage(cmd) {
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = cmdName + "|" + cmd._aliases[0];
    }
    let ancestorCmdNames = "";
    for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
      ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
    }
    return ancestorCmdNames + cmdName + " " + cmd.usage();
  }
  /**
   * Get the description for the command.
   *
   * @param {Command} cmd
   * @returns {string}
   */
  commandDescription(cmd) {
    return cmd.description();
  }
  /**
   * Get the subcommand summary to show in the list of subcommands.
   * (Fallback to description for backwards compatibility.)
   *
   * @param {Command} cmd
   * @returns {string}
   */
  subcommandDescription(cmd) {
    return cmd.summary() || cmd.description();
  }
  /**
   * Get the option description to show in the list of options.
   *
   * @param {Option} option
   * @return {string}
   */
  optionDescription(option) {
    const extraInfo = [];
    if (option.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
      );
    }
    if (option.defaultValue !== void 0) {
      const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
      if (showDefault) {
        extraInfo.push(
          `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
        );
      }
    }
    if (option.presetArg !== void 0 && option.optional) {
      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
    }
    if (option.envVar !== void 0) {
      extraInfo.push(`env: ${option.envVar}`);
    }
    if (extraInfo.length > 0) {
      const extraDescription = `(${extraInfo.join(", ")})`;
      if (option.description) {
        return `${option.description} ${extraDescription}`;
      }
      return extraDescription;
    }
    return option.description;
  }
  /**
   * Get the argument description to show in the list of arguments.
   *
   * @param {Argument} argument
   * @return {string}
   */
  argumentDescription(argument) {
    const extraInfo = [];
    if (argument.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
      );
    }
    if (argument.defaultValue !== void 0) {
      extraInfo.push(
        `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
      );
    }
    if (extraInfo.length > 0) {
      const extraDescription = `(${extraInfo.join(", ")})`;
      if (argument.description) {
        return `${argument.description} ${extraDescription}`;
      }
      return extraDescription;
    }
    return argument.description;
  }
  /**
   * Format a list of items, given a heading and an array of formatted items.
   *
   * @param {string} heading
   * @param {string[]} items
   * @param {Help} helper
   * @returns string[]
   */
  formatItemList(heading, items, helper) {
    if (items.length === 0) return [];
    return [helper.styleTitle(heading), ...items, ""];
  }
  /**
   * Group items by their help group heading.
   *
   * @param {Command[] | Option[]} unsortedItems
   * @param {Command[] | Option[]} visibleItems
   * @param {Function} getGroup
   * @returns {Map<string, Command[] | Option[]>}
   */
  groupItems(unsortedItems, visibleItems, getGroup) {
    const result = /* @__PURE__ */ new Map();
    unsortedItems.forEach((item) => {
      const group = getGroup(item);
      if (!result.has(group)) result.set(group, []);
    });
    visibleItems.forEach((item) => {
      const group = getGroup(item);
      if (!result.has(group)) {
        result.set(group, []);
      }
      result.get(group).push(item);
    });
    return result;
  }
  /**
   * Generate the built-in help text.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {string}
   */
  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth ?? 80;
    function callFormatItem(term, description) {
      return helper.formatItem(term, termWidth, description, helper);
    }
    let output = [
      `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
      ""
    ];
    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([
        helper.boxWrap(
          helper.styleCommandDescription(commandDescription),
          helpWidth
        ),
        ""
      ]);
    }
    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return callFormatItem(
        helper.styleArgumentTerm(helper.argumentTerm(argument)),
        helper.styleArgumentDescription(helper.argumentDescription(argument))
      );
    });
    output = output.concat(
      this.formatItemList("Arguments:", argumentList, helper)
    );
    const optionGroups = this.groupItems(
      cmd.options,
      helper.visibleOptions(cmd),
      (option) => option.helpGroupHeading ?? "Options:"
    );
    optionGroups.forEach((options, group) => {
      const optionList = options.map((option) => {
        return callFormatItem(
          helper.styleOptionTerm(helper.optionTerm(option)),
          helper.styleOptionDescription(helper.optionDescription(option))
        );
      });
      output = output.concat(this.formatItemList(group, optionList, helper));
    });
    if (helper.showGlobalOptions) {
      const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
        return callFormatItem(
          helper.styleOptionTerm(helper.optionTerm(option)),
          helper.styleOptionDescription(helper.optionDescription(option))
        );
      });
      output = output.concat(
        this.formatItemList("Global Options:", globalOptionList, helper)
      );
    }
    const commandGroups = this.groupItems(
      cmd.commands,
      helper.visibleCommands(cmd),
      (sub) => sub.helpGroup() || "Commands:"
    );
    commandGroups.forEach((commands, group) => {
      const commandList = commands.map((sub) => {
        return callFormatItem(
          helper.styleSubcommandTerm(helper.subcommandTerm(sub)),
          helper.styleSubcommandDescription(helper.subcommandDescription(sub))
        );
      });
      output = output.concat(this.formatItemList(group, commandList, helper));
    });
    return output.join("\n");
  }
  /**
   * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
   *
   * @param {string} str
   * @returns {number}
   */
  displayWidth(str) {
    return (0, import_node_util.stripVTControlCharacters)(str).length;
  }
  /**
   * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
   *
   * @param {string} str
   * @returns {string}
   */
  styleTitle(str) {
    return str;
  }
  styleUsage(str) {
    return str.split(" ").map((word) => {
      if (word === "[options]") return this.styleOptionText(word);
      if (word === "[command]") return this.styleSubcommandText(word);
      if (word[0] === "[" || word[0] === "<")
        return this.styleArgumentText(word);
      return this.styleCommandText(word);
    }).join(" ");
  }
  styleCommandDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleOptionDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleSubcommandDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleArgumentDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleDescriptionText(str) {
    return str;
  }
  styleOptionTerm(str) {
    return this.styleOptionText(str);
  }
  styleSubcommandTerm(str) {
    return str.split(" ").map((word) => {
      if (word === "[options]") return this.styleOptionText(word);
      if (word[0] === "[" || word[0] === "<")
        return this.styleArgumentText(word);
      return this.styleSubcommandText(word);
    }).join(" ");
  }
  styleArgumentTerm(str) {
    return this.styleArgumentText(str);
  }
  styleOptionText(str) {
    return str;
  }
  styleArgumentText(str) {
    return str;
  }
  styleSubcommandText(str) {
    return str;
  }
  styleCommandText(str) {
    return str;
  }
  /**
   * Calculate the pad width from the maximum term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */
  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestGlobalOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper)
    );
  }
  /**
   * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
   *
   * @param {string} str
   * @returns {boolean}
   */
  preformatted(str) {
    return /\n[^\S\r\n]/.test(str);
  }
  /**
   * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
   *
   * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
   *   TTT  DDD DDDD
   *        DD DDD
   *
   * @param {string} term
   * @param {number} termWidth
   * @param {string} description
   * @param {Help} helper
   * @returns {string}
   */
  formatItem(term, termWidth, description, helper) {
    const itemIndent = 2;
    const itemIndentStr = " ".repeat(itemIndent);
    if (!description) return itemIndentStr + term;
    const paddedTerm = term.padEnd(
      termWidth + term.length - helper.displayWidth(term)
    );
    const spacerWidth = 2;
    const helpWidth = this.helpWidth ?? 80;
    const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
    let formattedDescription;
    if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
      formattedDescription = description;
    } else {
      const wrappedDescription = helper.boxWrap(description, remainingWidth);
      formattedDescription = wrappedDescription.replace(
        /\n/g,
        "\n" + " ".repeat(termWidth + spacerWidth)
      );
    }
    return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
  }
  /**
   * Wrap a string at whitespace, preserving existing line breaks.
   * Wrapping is skipped if the width is less than `minWidthToWrap`.
   *
   * @param {string} str
   * @param {number} width
   * @returns {string}
   */
  boxWrap(str, width) {
    if (width < this.minWidthToWrap) return str;
    const rawLines = str.split(/\r\n|\n/);
    const chunkPattern = /[\s]*[^\s]+/g;
    const wrappedLines = [];
    rawLines.forEach((line) => {
      const chunks = line.match(chunkPattern);
      if (chunks === null) {
        wrappedLines.push("");
        return;
      }
      let sumChunks = [chunks.shift()];
      let sumWidth = this.displayWidth(sumChunks[0]);
      chunks.forEach((chunk) => {
        const visibleWidth = this.displayWidth(chunk);
        if (sumWidth + visibleWidth <= width) {
          sumChunks.push(chunk);
          sumWidth += visibleWidth;
          return;
        }
        wrappedLines.push(sumChunks.join(""));
        const nextChunk = chunk.trimStart();
        sumChunks = [nextChunk];
        sumWidth = this.displayWidth(nextChunk);
      });
      wrappedLines.push(sumChunks.join(""));
    });
    return wrappedLines.join("\n");
  }
};

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/lib/option.js
var Option = class {
  /**
   * Initialize a new `Option` with the given `flags` and `description`.
   *
   * @param {string} flags
   * @param {string} [description]
   */
  constructor(flags, description) {
    this.flags = flags;
    this.description = description || "";
    this.required = flags.includes("<");
    this.optional = flags.includes("[");
    this.variadic = /\w\.\.\.[>\]]$/.test(flags);
    this.mandatory = false;
    const optionFlags = splitOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith("--no-");
    }
    this.defaultValue = void 0;
    this.defaultValueDescription = void 0;
    this.presetArg = void 0;
    this.envVar = void 0;
    this.parseArg = void 0;
    this.hidden = false;
    this.argChoices = void 0;
    this.conflictsWith = [];
    this.implied = void 0;
    this.helpGroupHeading = void 0;
  }
  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Option}
   */
  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }
  /**
   * Preset to use when option used without option-argument, especially optional but also boolean and negated.
   * The custom processing (parseArg) is called.
   *
   * @example
   * new Option('--color').default('GREYSCALE').preset('RGB');
   * new Option('--donate [amount]').preset('20').argParser(parseFloat);
   *
   * @param {*} arg
   * @return {Option}
   */
  preset(arg) {
    this.presetArg = arg;
    return this;
  }
  /**
   * Add option name(s) that conflict with this option.
   * An error will be displayed if conflicting options are found during parsing.
   *
   * @example
   * new Option('--rgb').conflicts('cmyk');
   * new Option('--js').conflicts(['ts', 'jsx']);
   *
   * @param {(string | string[])} names
   * @return {Option}
   */
  conflicts(names) {
    this.conflictsWith = this.conflictsWith.concat(names);
    return this;
  }
  /**
   * Specify implied option values for when this option is set and the implied options are not.
   *
   * The custom processing (parseArg) is not called on the implied values.
   *
   * @example
   * program
   *   .addOption(new Option('--log', 'write logging information to file'))
   *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
   *
   * @param {object} impliedOptionValues
   * @return {Option}
   */
  implies(impliedOptionValues) {
    let newImplied = impliedOptionValues;
    if (typeof impliedOptionValues === "string") {
      newImplied = { [impliedOptionValues]: true };
    }
    this.implied = Object.assign(this.implied || {}, newImplied);
    return this;
  }
  /**
   * Set environment variable to check for option value.
   *
   * An environment variable is only used if when processed the current option value is
   * undefined, or the source of the current value is 'default' or 'config' or 'env'.
   *
   * @param {string} name
   * @return {Option}
   */
  env(name) {
    this.envVar = name;
    return this;
  }
  /**
   * Set the custom handler for processing CLI option arguments into option values.
   *
   * @param {Function} [fn]
   * @return {Option}
   */
  argParser(fn) {
    this.parseArg = fn;
    return this;
  }
  /**
   * Whether the option is mandatory and must have a value after parsing.
   *
   * @param {boolean} [mandatory=true]
   * @return {Option}
   */
  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }
  /**
   * Hide option in help.
   *
   * @param {boolean} [hide=true]
   * @return {Option}
   */
  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }
  /**
   * @package
   */
  _collectValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }
    previous.push(value);
    return previous;
  }
  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Option}
   */
  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${this.argChoices.join(", ")}.`
        );
      }
      if (this.variadic) {
        return this._collectValue(arg, previous);
      }
      return arg;
    };
    return this;
  }
  /**
   * Return option name.
   *
   * @return {string}
   */
  name() {
    if (this.long) {
      return this.long.replace(/^--/, "");
    }
    return this.short.replace(/^-/, "");
  }
  /**
   * Return option name, in a camelcase format that can be used
   * as an object attribute key.
   *
   * @return {string}
   */
  attributeName() {
    if (this.negate) {
      return camelcase(this.name().replace(/^no-/, ""));
    }
    return camelcase(this.name());
  }
  /**
   * Set the help group heading.
   *
   * @param {string} heading
   * @return {Option}
   */
  helpGroup(heading) {
    this.helpGroupHeading = heading;
    return this;
  }
  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @package
   */
  is(arg) {
    return this.short === arg || this.long === arg;
  }
  /**
   * Return whether a boolean option.
   *
   * Options are one of boolean, negated, required argument, or optional argument.
   *
   * @return {boolean}
   * @package
   */
  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
};
var DualOptions = class {
  /**
   * @param {Option[]} options
   */
  constructor(options) {
    this.positiveOptions = /* @__PURE__ */ new Map();
    this.negativeOptions = /* @__PURE__ */ new Map();
    this.dualOptions = /* @__PURE__ */ new Set();
    options.forEach((option) => {
      if (option.negate) {
        this.negativeOptions.set(option.attributeName(), option);
      } else {
        this.positiveOptions.set(option.attributeName(), option);
      }
    });
    this.negativeOptions.forEach((value, key) => {
      if (this.positiveOptions.has(key)) {
        this.dualOptions.add(key);
      }
    });
  }
  /**
   * Did the value come from the option, and not from possible matching dual option?
   *
   * @param {*} value
   * @param {Option} option
   * @returns {boolean}
   */
  valueFromOption(value, option) {
    const optionKey = option.attributeName();
    if (!this.dualOptions.has(optionKey)) return true;
    const preset = this.negativeOptions.get(optionKey).presetArg;
    const negativeValue = preset !== void 0 ? preset : false;
    return option.negate === (negativeValue === value);
  }
};
function camelcase(str) {
  return str.split("-").reduce((str2, word) => {
    return str2 + word[0].toUpperCase() + word.slice(1);
  });
}
function splitOptionFlags(flags) {
  let shortFlag;
  let longFlag;
  const shortFlagExp = /^-[^-]$/;
  const longFlagExp = /^--[^-]/;
  const flagParts = flags.split(/[ |,]+/).concat("guard");
  if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
  if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
  if (!shortFlag && shortFlagExp.test(flagParts[0]))
    shortFlag = flagParts.shift();
  if (!shortFlag && longFlagExp.test(flagParts[0])) {
    shortFlag = longFlag;
    longFlag = flagParts.shift();
  }
  if (flagParts[0].startsWith("-")) {
    const unsupportedFlag = flagParts[0];
    const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
    if (/^-[^-][^-]/.test(unsupportedFlag))
      throw new Error(
        `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
      );
    if (shortFlagExp.test(unsupportedFlag))
      throw new Error(`${baseError}
- too many short flags`);
    if (longFlagExp.test(unsupportedFlag))
      throw new Error(`${baseError}
- too many long flags`);
    throw new Error(`${baseError}
- unrecognised flag format`);
  }
  if (shortFlag === void 0 && longFlag === void 0)
    throw new Error(
      `option creation failed due to no flags found in '${flags}'.`
    );
  return { shortFlag, longFlag };
}

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/lib/suggestSimilar.js
var maxDistance = 3;
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > maxDistance)
    return Math.max(a.length, b.length);
  const d = [];
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      let cost;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        // deletion
        d[i][j - 1] + 1,
        // insertion
        d[i - 1][j - 1] + cost
        // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}
function suggestSimilar(word, candidates) {
  if (!candidates || candidates.length === 0) return "";
  candidates = Array.from(new Set(candidates));
  const searchingOptions = word.startsWith("--");
  if (searchingOptions) {
    word = word.slice(2);
    candidates = candidates.map((candidate) => candidate.slice(2));
  }
  let similar = [];
  let bestDistance = maxDistance;
  const minSimilarity = 0.4;
  candidates.forEach((candidate) => {
    if (candidate.length <= 1) return;
    const distance = editDistance(word, candidate);
    const length = Math.max(word.length, candidate.length);
    const similarity = (length - distance) / length;
    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        bestDistance = distance;
        similar = [candidate];
      } else if (distance === bestDistance) {
        similar.push(candidate);
      }
    }
  });
  similar.sort((a, b) => a.localeCompare(b));
  if (searchingOptions) {
    similar = similar.map((candidate) => `--${candidate}`);
  }
  if (similar.length > 1) {
    return `
(Did you mean one of ${similar.join(", ")}?)`;
  }
  if (similar.length === 1) {
    return `
(Did you mean ${similar[0]}?)`;
  }
  return "";
}

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/lib/command.js
var Command = class _Command extends import_node_events.EventEmitter {
  /**
   * Initialize a new `Command`.
   *
   * @param {string} [name]
   */
  constructor(name) {
    super();
    this.commands = [];
    this.options = [];
    this.parent = null;
    this._allowUnknownOption = false;
    this._allowExcessArguments = false;
    this.registeredArguments = [];
    this._args = this.registeredArguments;
    this.args = [];
    this.rawArgs = [];
    this.processedArgs = [];
    this._scriptPath = null;
    this._name = name || "";
    this._optionValues = {};
    this._optionValueSources = {};
    this._storeOptionsAsProperties = false;
    this._actionHandler = null;
    this._executableHandler = false;
    this._executableFile = null;
    this._executableDir = null;
    this._defaultCommandName = null;
    this._exitCallback = null;
    this._aliases = [];
    this._combineFlagAndOptionalValue = true;
    this._description = "";
    this._summary = "";
    this._argsDescription = void 0;
    this._enablePositionalOptions = false;
    this._passThroughOptions = false;
    this._lifeCycleHooks = {};
    this._showHelpAfterError = false;
    this._showSuggestionAfterError = true;
    this._savedState = null;
    this._outputConfiguration = {
      writeOut: (str) => import_node_process.default.stdout.write(str),
      writeErr: (str) => import_node_process.default.stderr.write(str),
      outputError: (str, write) => write(str),
      getOutHelpWidth: () => import_node_process.default.stdout.isTTY ? import_node_process.default.stdout.columns : void 0,
      getErrHelpWidth: () => import_node_process.default.stderr.isTTY ? import_node_process.default.stderr.columns : void 0,
      getOutHasColors: () => useColor() ?? (import_node_process.default.stdout.isTTY && import_node_process.default.stdout.hasColors?.()),
      getErrHasColors: () => useColor() ?? (import_node_process.default.stderr.isTTY && import_node_process.default.stderr.hasColors?.()),
      stripColor: (str) => (0, import_node_util2.stripVTControlCharacters)(str)
    };
    this._hidden = false;
    this._helpOption = void 0;
    this._addImplicitHelpCommand = void 0;
    this._helpCommand = void 0;
    this._helpConfiguration = {};
    this._helpGroupHeading = void 0;
    this._defaultCommandGroup = void 0;
    this._defaultOptionGroup = void 0;
  }
  /**
   * Copy settings that are useful to have in common across root command and subcommands.
   *
   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
   *
   * @param {Command} sourceCommand
   * @return {Command} `this` command for chaining
   */
  copyInheritedSettings(sourceCommand) {
    this._outputConfiguration = sourceCommand._outputConfiguration;
    this._helpOption = sourceCommand._helpOption;
    this._helpCommand = sourceCommand._helpCommand;
    this._helpConfiguration = sourceCommand._helpConfiguration;
    this._exitCallback = sourceCommand._exitCallback;
    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
    this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
    this._allowExcessArguments = sourceCommand._allowExcessArguments;
    this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
    this._showHelpAfterError = sourceCommand._showHelpAfterError;
    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
    return this;
  }
  /**
   * @returns {Command[]}
   * @private
   */
  _getCommandAndAncestors() {
    const result = [];
    for (let command = this; command; command = command.parent) {
      result.push(command);
    }
    return result;
  }
  /**
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * @example
   * // Command implemented using action handler (description is supplied separately to `.command`)
   * program
   *   .command('clone <source> [destination]')
   *   .description('clone a repository into a newly created directory')
   *   .action((source, destination) => {
   *     console.log('clone command called');
   *   });
   *
   * // Command implemented using separate executable file (description is second parameter to `.command`)
   * program
   *   .command('start <service>', 'start named service')
   *   .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
   * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
   * @param {object} [execOpts] - configuration options (for executable)
   * @return {Command} returns new command for action handler, or `this` for executable command
   */
  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc;
    let opts = execOpts;
    if (typeof desc === "object" && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
    const cmd = this.createCommand(name);
    if (desc) {
      cmd.description(desc);
      cmd._executableHandler = true;
    }
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    cmd._hidden = !!(opts.noHelp || opts.hidden);
    cmd._executableFile = opts.executableFile || null;
    if (args) cmd.arguments(args);
    this._registerCommand(cmd);
    cmd.parent = this;
    cmd.copyInheritedSettings(this);
    if (desc) return this;
    return cmd;
  }
  /**
   * Factory routine to create a new unattached command.
   *
   * See .command() for creating an attached subcommand, which uses this routine to
   * create the command. You can override createCommand to customise subcommands.
   *
   * @param {string} [name]
   * @return {Command} new command
   */
  createCommand(name) {
    return new _Command(name);
  }
  /**
   * You can customise the help with a subclass of Help by overriding createHelp,
   * or by overriding Help properties using configureHelp().
   *
   * @return {Help}
   */
  createHelp() {
    return Object.assign(new Help(), this.configureHelp());
  }
  /**
   * You can customise the help by overriding Help properties using configureHelp(),
   * or with a subclass of Help by overriding createHelp().
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */
  configureHelp(configuration) {
    if (configuration === void 0) return this._helpConfiguration;
    this._helpConfiguration = configuration;
    return this;
  }
  /**
   * The default output goes to stdout and stderr. You can customise this for special
   * applications. You can also customise the display of errors by overriding outputError.
   *
   * The configuration properties are all functions:
   *
   *     // change how output being written, defaults to stdout and stderr
   *     writeOut(str)
   *     writeErr(str)
   *     // change how output being written for errors, defaults to writeErr
   *     outputError(str, write) // used for displaying errors and not used for displaying help
   *     // specify width for wrapping help
   *     getOutHelpWidth()
   *     getErrHelpWidth()
   *     // color support, currently only used with Help
   *     getOutHasColors()
   *     getErrHasColors()
   *     stripColor() // used to remove ANSI escape codes if output does not have colors
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */
  configureOutput(configuration) {
    if (configuration === void 0) return this._outputConfiguration;
    this._outputConfiguration = {
      ...this._outputConfiguration,
      ...configuration
    };
    return this;
  }
  /**
   * Display the help or a custom message after an error occurs.
   *
   * @param {(boolean|string)} [displayHelp]
   * @return {Command} `this` command for chaining
   */
  showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
    this._showHelpAfterError = displayHelp;
    return this;
  }
  /**
   * Display suggestion of similar commands for unknown commands, or options for unknown options.
   *
   * @param {boolean} [displaySuggestion]
   * @return {Command} `this` command for chaining
   */
  showSuggestionAfterError(displaySuggestion = true) {
    this._showSuggestionAfterError = !!displaySuggestion;
    return this;
  }
  /**
   * Add a prepared subcommand.
   *
   * See .command() for creating an attached subcommand which inherits settings from its parent.
   *
   * @param {Command} cmd - new subcommand
   * @param {object} [opts] - configuration options
   * @return {Command} `this` command for chaining
   */
  addCommand(cmd, opts) {
    if (!cmd._name) {
      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
    }
    opts = opts || {};
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    if (opts.noHelp || opts.hidden) cmd._hidden = true;
    this._registerCommand(cmd);
    cmd.parent = this;
    cmd._checkForBrokenPassThrough();
    return this;
  }
  /**
   * Factory routine to create a new unattached argument.
   *
   * See .argument() for creating an attached argument, which uses this routine to
   * create the argument. You can override createArgument to return a custom argument.
   *
   * @param {string} name
   * @param {string} [description]
   * @return {Argument} new argument
   */
  createArgument(name, description) {
    return new Argument(name, description);
  }
  /**
   * Define argument syntax for command.
   *
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @example
   * program.argument('<input-file>');
   * program.argument('[output-file]');
   *
   * @param {string} name
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom argument processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  argument(name, description, parseArg, defaultValue) {
    const argument = this.createArgument(name, description);
    if (typeof parseArg === "function") {
      argument.default(defaultValue).argParser(parseArg);
    } else {
      argument.default(parseArg);
    }
    this.addArgument(argument);
    return this;
  }
  /**
   * Define argument syntax for command, adding multiple at once (without descriptions).
   *
   * See also .argument().
   *
   * @example
   * program.arguments('<cmd> [env]');
   *
   * @param {string} names
   * @return {Command} `this` command for chaining
   */
  arguments(names) {
    names.trim().split(/ +/).forEach((detail) => {
      this.argument(detail);
    });
    return this;
  }
  /**
   * Define argument syntax for command, adding a prepared argument.
   *
   * @param {Argument} argument
   * @return {Command} `this` command for chaining
   */
  addArgument(argument) {
    const previousArgument = this.registeredArguments.slice(-1)[0];
    if (previousArgument?.variadic) {
      throw new Error(
        `only the last argument can be variadic '${previousArgument.name()}'`
      );
    }
    if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
      throw new Error(
        `a default value for a required argument is never used: '${argument.name()}'`
      );
    }
    this.registeredArguments.push(argument);
    return this;
  }
  /**
   * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
   *
   * @example
   *    program.helpCommand('help [cmd]');
   *    program.helpCommand('help [cmd]', 'show help');
   *    program.helpCommand(false); // suppress default help command
   *    program.helpCommand(true); // add help command even if no subcommands
   *
   * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
   * @param {string} [description] - custom description
   * @return {Command} `this` command for chaining
   */
  helpCommand(enableOrNameAndArgs, description) {
    if (typeof enableOrNameAndArgs === "boolean") {
      this._addImplicitHelpCommand = enableOrNameAndArgs;
      if (enableOrNameAndArgs && this._defaultCommandGroup) {
        this._initCommandGroup(this._getHelpCommand());
      }
      return this;
    }
    const nameAndArgs = enableOrNameAndArgs ?? "help [command]";
    const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
    const helpDescription = description ?? "display help for command";
    const helpCommand = this.createCommand(helpName);
    helpCommand.helpOption(false);
    if (helpArgs) helpCommand.arguments(helpArgs);
    if (helpDescription) helpCommand.description(helpDescription);
    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;
    if (enableOrNameAndArgs || description) this._initCommandGroup(helpCommand);
    return this;
  }
  /**
   * Add prepared custom help command.
   *
   * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
   * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
   * @return {Command} `this` command for chaining
   */
  addHelpCommand(helpCommand, deprecatedDescription) {
    if (typeof helpCommand !== "object") {
      this.helpCommand(helpCommand, deprecatedDescription);
      return this;
    }
    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;
    this._initCommandGroup(helpCommand);
    return this;
  }
  /**
   * Lazy create help command.
   *
   * @return {(Command|null)}
   * @package
   */
  _getHelpCommand() {
    const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
    if (hasImplicitHelpCommand) {
      if (this._helpCommand === void 0) {
        this.helpCommand(void 0, void 0);
      }
      return this._helpCommand;
    }
    return null;
  }
  /**
   * Add hook for life cycle event.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {Command} `this` command for chaining
   */
  hook(event, listener) {
    const allowedValues = ["preSubcommand", "preAction", "postAction"];
    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener);
    } else {
      this._lifeCycleHooks[event] = [listener];
    }
    return this;
  }
  /**
   * Register callback to use as replacement for calling process.exit.
   *
   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
   * @return {Command} `this` command for chaining
   */
  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn;
    } else {
      this._exitCallback = (err) => {
        if (err.code !== "commander.executeSubCommandAsync") {
          throw err;
        } else {
        }
      };
    }
    return this;
  }
  /**
   * Call process.exit, and _exitCallback if defined.
   *
   * @param {number} exitCode exit code for using with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @return never
   * @private
   */
  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError(exitCode, code, message));
    }
    import_node_process.default.exit(exitCode);
  }
  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('serve')
   *   .description('start service')
   *   .action(function() {
   *      // do work here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */
  action(fn) {
    const listener = (args) => {
      const expectedArgsCount = this.registeredArguments.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this;
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);
      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  }
  /**
   * Factory routine to create a new unattached option.
   *
   * See .option() for creating an attached option, which uses this routine to
   * create the option. You can override createOption to return a custom option.
   *
   * @param {string} flags
   * @param {string} [description]
   * @return {Option} new option
   */
  createOption(flags, description) {
    return new Option(flags, description);
  }
  /**
   * Wrap parseArgs to catch 'commander.invalidArgument'.
   *
   * @param {(Option | Argument)} target
   * @param {string} value
   * @param {*} previous
   * @param {string} invalidArgumentMessage
   * @private
   */
  _callParseArg(target, value, previous, invalidArgumentMessage) {
    try {
      return target.parseArg(value, previous);
    } catch (err) {
      if (err.code === "commander.invalidArgument") {
        const message = `${invalidArgumentMessage} ${err.message}`;
        this.error(message, { exitCode: err.exitCode, code: err.code });
      }
      throw err;
    }
  }
  /**
   * Check for option flag conflicts.
   * Register option if no conflicts found, or throw on conflict.
   *
   * @param {Option} option
   * @private
   */
  _registerOption(option) {
    const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
    if (matchingOption) {
      const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
      throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
    }
    this._initOptionGroup(option);
    this.options.push(option);
  }
  /**
   * Check for command name and alias conflicts with existing commands.
   * Register command if no conflicts found, or throw on conflict.
   *
   * @param {Command} command
   * @private
   */
  _registerCommand(command) {
    const knownBy = (cmd) => {
      return [cmd.name()].concat(cmd.aliases());
    };
    const alreadyUsed = knownBy(command).find(
      (name) => this._findCommand(name)
    );
    if (alreadyUsed) {
      const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
      const newCmd = knownBy(command).join("|");
      throw new Error(
        `cannot add command '${newCmd}' as already have command '${existingCmd}'`
      );
    }
    this._initCommandGroup(command);
    this.commands.push(command);
  }
  /**
   * Add an option.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addOption(option) {
    this._registerOption(option);
    const oname = option.name();
    const name = option.attributeName();
    if (option.defaultValue !== void 0) {
      this.setOptionValueWithSource(name, option.defaultValue, "default");
    }
    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      if (val == null && option.presetArg !== void 0) {
        val = option.presetArg;
      }
      const oldValue = this.getOptionValue(name);
      if (val !== null && option.parseArg) {
        val = this._callParseArg(option, val, oldValue, invalidValueMessage);
      } else if (val !== null && option.variadic) {
        val = option._collectValue(val, oldValue);
      }
      if (val == null) {
        if (option.negate) {
          val = false;
        } else if (option.isBoolean() || option.optional) {
          val = true;
        } else {
          val = "";
        }
      }
      this.setOptionValueWithSource(name, val, valueSource);
    };
    this.on("option:" + oname, (val) => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
      handleOptionValue(val, invalidValueMessage, "cli");
    });
    if (option.envVar) {
      this.on("optionEnv:" + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, "env");
      });
    }
    return this;
  }
  /**
   * Internal implementation shared by .option() and .requiredOption()
   *
   * @return {Command} `this` command for chaining
   * @private
   */
  _optionEx(config, flags, description, fn, defaultValue) {
    if (typeof flags === "object" && flags instanceof Option) {
      throw new Error(
        "To add an Option object use addOption() instead of option() or requiredOption()"
      );
    }
    const option = this.createOption(flags, description);
    option.makeOptionMandatory(!!config.mandatory);
    if (typeof fn === "function") {
      option.default(defaultValue).argParser(fn);
    } else if (fn instanceof RegExp) {
      const regex = fn;
      fn = (val, def) => {
        const m = regex.exec(val);
        return m ? m[0] : def;
      };
      option.default(defaultValue).argParser(fn);
    } else {
      option.default(fn);
    }
    return this.addOption(option);
  }
  /**
   * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
   * option-argument is indicated by `<>` and an optional option-argument by `[]`.
   *
   * See the README for more details, and see also addOption() and requiredOption().
   *
   * @example
   * program
   *     .option('-p, --pepper', 'add pepper')
   *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
   *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
   *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  option(flags, description, parseArg, defaultValue) {
    return this._optionEx({}, flags, description, parseArg, defaultValue);
  }
  /**
   * Add a required option which must have a value after parsing. This usually means
   * the option must be specified on the command line. (Otherwise the same as .option().)
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  requiredOption(flags, description, parseArg, defaultValue) {
    return this._optionEx(
      { mandatory: true },
      flags,
      description,
      parseArg,
      defaultValue
    );
  }
  /**
   * Alter parsing of short flags with optional values.
   *
   * @example
   * // for `.option('-f,--flag [value]'):
   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
   *
   * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
   * @return {Command} `this` command for chaining
   */
  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine;
    return this;
  }
  /**
   * Allow unknown options on the command line.
   *
   * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
   * @return {Command} `this` command for chaining
   */
  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown;
    return this;
  }
  /**
   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
   *
   * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
   * @return {Command} `this` command for chaining
   */
  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess;
    return this;
  }
  /**
   * Enable positional options. Positional means global options are specified before subcommands which lets
   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
   * The default behaviour is non-positional and global options may appear anywhere on the command line.
   *
   * @param {boolean} [positional]
   * @return {Command} `this` command for chaining
   */
  enablePositionalOptions(positional = true) {
    this._enablePositionalOptions = !!positional;
    return this;
  }
  /**
   * Pass through options that come after command-arguments rather than treat them as command-options,
   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
   * positional options to have been enabled on the program (parent commands).
   * The default behaviour is non-positional and options may appear before or after command-arguments.
   *
   * @param {boolean} [passThrough] for unknown options.
   * @return {Command} `this` command for chaining
   */
  passThroughOptions(passThrough = true) {
    this._passThroughOptions = !!passThrough;
    this._checkForBrokenPassThrough();
    return this;
  }
  /**
   * @private
   */
  _checkForBrokenPassThrough() {
    if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
      throw new Error(
        `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
      );
    }
  }
  /**
   * Whether to store option values as properties on command object,
   * or store separately (specify false). In both cases the option values can be accessed using .opts().
   *
   * @param {boolean} [storeAsProperties=true]
   * @return {Command} `this` command for chaining
   */
  storeOptionsAsProperties(storeAsProperties = true) {
    if (this.options.length) {
      throw new Error("call .storeOptionsAsProperties() before adding options");
    }
    if (Object.keys(this._optionValues).length) {
      throw new Error(
        "call .storeOptionsAsProperties() before setting option values"
      );
    }
    this._storeOptionsAsProperties = !!storeAsProperties;
    return this;
  }
  /**
   * Retrieve option value.
   *
   * @param {string} key
   * @return {object} value
   */
  getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key];
    }
    return this._optionValues[key];
  }
  /**
   * Store option value.
   *
   * @param {string} key
   * @param {object} value
   * @return {Command} `this` command for chaining
   */
  setOptionValue(key, value) {
    return this.setOptionValueWithSource(key, value, void 0);
  }
  /**
   * Store option value and where the value came from.
   *
   * @param {string} key
   * @param {object} value
   * @param {string} source - expected values are default/config/env/cli/implied
   * @return {Command} `this` command for chaining
   */
  setOptionValueWithSource(key, value, source) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
    this._optionValueSources[key] = source;
    return this;
  }
  /**
   * Get source of option value.
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */
  getOptionValueSource(key) {
    return this._optionValueSources[key];
  }
  /**
   * Get source of option value. See also .optsWithGlobals().
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */
  getOptionValueSourceWithGlobals(key) {
    let source;
    this._getCommandAndAncestors().forEach((cmd) => {
      if (cmd.getOptionValueSource(key) !== void 0) {
        source = cmd.getOptionValueSource(key);
      }
    });
    return source;
  }
  /**
   * Get user arguments from implied or explicit arguments.
   * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
   *
   * @private
   */
  _prepareUserArgs(argv, parseOptions) {
    if (argv !== void 0 && !Array.isArray(argv)) {
      throw new Error("first parameter to parse must be array or undefined");
    }
    parseOptions = parseOptions || {};
    if (argv === void 0 && parseOptions.from === void 0) {
      if (import_node_process.default.versions?.electron) {
        parseOptions.from = "electron";
      }
      const execArgv = import_node_process.default.execArgv ?? [];
      if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
        parseOptions.from = "eval";
      }
    }
    if (argv === void 0) {
      argv = import_node_process.default.argv;
    }
    this.rawArgs = argv.slice();
    let userArgs;
    switch (parseOptions.from) {
      case void 0:
      case "node":
        this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case "electron":
        if (import_node_process.default.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case "user":
        userArgs = argv.slice(0);
        break;
      case "eval":
        userArgs = argv.slice(1);
        break;
      default:
        throw new Error(
          `unexpected parse option { from: '${parseOptions.from}' }`
        );
    }
    if (!this._name && this._scriptPath)
      this.nameFromFilename(this._scriptPath);
    this._name = this._name || "program";
    return userArgs;
  }
  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Use parseAsync instead of parse if any of your action handlers are async.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * program.parse(); // parse process.argv and auto-detect electron and special node flags
   * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv] - optional, defaults to process.argv
   * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
   * @return {Command} `this` command for chaining
   */
  parse(argv, parseOptions) {
    this._prepareForParse();
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    this._parseCommand([], userArgs);
    return this;
  }
  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
   * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv]
   * @param {object} [parseOptions]
   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
   * @return {Promise}
   */
  async parseAsync(argv, parseOptions) {
    this._prepareForParse();
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    await this._parseCommand([], userArgs);
    return this;
  }
  _prepareForParse() {
    if (this._savedState === null) {
      this.options.filter(
        (option) => option.negate && option.defaultValue === void 0 && this.getOptionValue(option.attributeName()) === void 0
      ).forEach((option) => {
        const positiveLongFlag = option.long.replace(/^--no-/, "--");
        if (!this._findOption(positiveLongFlag)) {
          this.setOptionValueWithSource(
            option.attributeName(),
            true,
            "default"
          );
        }
      });
      this.saveStateBeforeParse();
    } else {
      this.restoreStateBeforeParse();
    }
  }
  /**
   * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
   * Not usually called directly, but available for subclasses to save their custom state.
   *
   * This is called in a lazy way. Only commands used in parsing chain will have state saved.
   */
  saveStateBeforeParse() {
    this._savedState = {
      // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
      _name: this._name,
      // option values before parse have default values (including false for negated options)
      // shallow clones
      _optionValues: { ...this._optionValues },
      _optionValueSources: { ...this._optionValueSources }
    };
  }
  /**
   * Restore state before parse for calls after the first.
   * Not usually called directly, but available for subclasses to save their custom state.
   *
   * This is called in a lazy way. Only commands used in parsing chain will have state restored.
   */
  restoreStateBeforeParse() {
    if (this._storeOptionsAsProperties)
      throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
    this._name = this._savedState._name;
    this._scriptPath = null;
    this.rawArgs = [];
    this._optionValues = { ...this._savedState._optionValues };
    this._optionValueSources = { ...this._savedState._optionValueSources };
    this.args = [];
    this.processedArgs = [];
  }
  /**
   * Throw if expected executable is missing. Add lots of help for author.
   *
   * @param {string} executableFile
   * @param {string} executableDir
   * @param {string} subcommandName
   */
  _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
    if (import_node_fs.default.existsSync(executableFile)) return;
    const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
    const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
    throw new Error(executableMissing);
  }
  /**
   * Execute a sub-command executable.
   *
   * @private
   */
  _executeSubCommand(subcommand, args) {
    args = args.slice();
    const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
    function findFile(baseDir, baseName) {
      const localBin = import_node_path.default.resolve(baseDir, baseName);
      if (import_node_fs.default.existsSync(localBin)) return localBin;
      if (sourceExt.includes(import_node_path.default.extname(baseName))) return void 0;
      const foundExt = sourceExt.find(
        (ext) => import_node_fs.default.existsSync(`${localBin}${ext}`)
      );
      if (foundExt) return `${localBin}${foundExt}`;
      return void 0;
    }
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();
    let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
    let executableDir = this._executableDir || "";
    if (this._scriptPath) {
      let resolvedScriptPath;
      try {
        resolvedScriptPath = import_node_fs.default.realpathSync(this._scriptPath);
      } catch {
        resolvedScriptPath = this._scriptPath;
      }
      executableDir = import_node_path.default.resolve(
        import_node_path.default.dirname(resolvedScriptPath),
        executableDir
      );
    }
    if (executableDir) {
      let localFile = findFile(executableDir, executableFile);
      if (!localFile && !subcommand._executableFile && this._scriptPath) {
        const legacyName = import_node_path.default.basename(
          this._scriptPath,
          import_node_path.default.extname(this._scriptPath)
        );
        if (legacyName !== this._name) {
          localFile = findFile(
            executableDir,
            `${legacyName}-${subcommand._name}`
          );
        }
      }
      executableFile = localFile || executableFile;
    }
    const launchWithNode = sourceExt.includes(import_node_path.default.extname(executableFile));
    let proc;
    if (import_node_process.default.platform !== "win32") {
      if (launchWithNode) {
        args.unshift(executableFile);
        args = incrementNodeInspectorPort(import_node_process.default.execArgv).concat(args);
        proc = import_node_child_process.default.spawn(import_node_process.default.argv[0], args, { stdio: "inherit" });
      } else {
        proc = import_node_child_process.default.spawn(executableFile, args, { stdio: "inherit" });
      }
    } else {
      this._checkForMissingExecutable(
        executableFile,
        executableDir,
        subcommand._name
      );
      args.unshift(executableFile);
      args = incrementNodeInspectorPort(import_node_process.default.execArgv).concat(args);
      proc = import_node_child_process.default.spawn(import_node_process.default.execPath, args, { stdio: "inherit" });
    }
    if (!proc.killed) {
      const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
      signals.forEach((signal) => {
        import_node_process.default.on(signal, () => {
          if (proc.killed === false && proc.exitCode === null) {
            proc.kill(signal);
          }
        });
      });
    }
    const exitCallback = this._exitCallback;
    proc.on("close", (code) => {
      code = code ?? 1;
      if (!exitCallback) {
        import_node_process.default.exit(code);
      } else {
        exitCallback(
          new CommanderError(
            code,
            "commander.executeSubCommandAsync",
            "(close)"
          )
        );
      }
    });
    proc.on("error", (err) => {
      if (err.code === "ENOENT") {
        this._checkForMissingExecutable(
          executableFile,
          executableDir,
          subcommand._name
        );
      } else if (err.code === "EACCES") {
        throw new Error(`'${executableFile}' not executable`);
      }
      if (!exitCallback) {
        import_node_process.default.exit(1);
      } else {
        const wrappedError = new CommanderError(
          1,
          "commander.executeSubCommandAsync",
          "(error)"
        );
        wrappedError.nestedError = err;
        exitCallback(wrappedError);
      }
    });
    this.runningCommand = proc;
  }
  /**
   * @private
   */
  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName);
    if (!subCommand) this.help({ error: true });
    subCommand._prepareForParse();
    let promiseChain;
    promiseChain = this._chainOrCallSubCommandHook(
      promiseChain,
      subCommand,
      "preSubcommand"
    );
    promiseChain = this._chainOrCall(promiseChain, () => {
      if (subCommand._executableHandler) {
        this._executeSubCommand(subCommand, operands.concat(unknown));
      } else {
        return subCommand._parseCommand(operands, unknown);
      }
    });
    return promiseChain;
  }
  /**
   * Invoke help directly if possible, or dispatch if necessary.
   * e.g. help foo
   *
   * @private
   */
  _dispatchHelpCommand(subcommandName) {
    if (!subcommandName) {
      this.help();
    }
    const subCommand = this._findCommand(subcommandName);
    if (subCommand && !subCommand._executableHandler) {
      subCommand.help();
    }
    return this._dispatchSubcommand(
      subcommandName,
      [],
      [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
    );
  }
  /**
   * Check this.args against expected this.registeredArguments.
   *
   * @private
   */
  _checkNumberOfArguments() {
    this.registeredArguments.forEach((arg, i) => {
      if (arg.required && this.args[i] == null) {
        this.missingArgument(arg.name());
      }
    });
    if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
      return;
    }
    if (this.args.length > this.registeredArguments.length) {
      this._excessArguments(this.args);
    }
  }
  /**
   * Process this.args using this.registeredArguments and save as this.processedArgs!
   *
   * @private
   */
  _processArguments() {
    const myParseArg = (argument, value, previous) => {
      let parsedValue = value;
      if (value !== null && argument.parseArg) {
        const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
        parsedValue = this._callParseArg(
          argument,
          value,
          previous,
          invalidValueMessage
        );
      }
      return parsedValue;
    };
    this._checkNumberOfArguments();
    const processedArgs = [];
    this.registeredArguments.forEach((declaredArg, index) => {
      let value = declaredArg.defaultValue;
      if (declaredArg.variadic) {
        if (index < this.args.length) {
          value = this.args.slice(index);
          if (declaredArg.parseArg) {
            value = value.reduce((processed, v) => {
              return myParseArg(declaredArg, v, processed);
            }, declaredArg.defaultValue);
          }
        } else if (value === void 0) {
          value = [];
        }
      } else if (index < this.args.length) {
        value = this.args[index];
        if (declaredArg.parseArg) {
          value = myParseArg(declaredArg, value, declaredArg.defaultValue);
        }
      }
      processedArgs[index] = value;
    });
    this.processedArgs = processedArgs;
  }
  /**
   * Once we have a promise we chain, but call synchronously until then.
   *
   * @param {(Promise|undefined)} promise
   * @param {Function} fn
   * @return {(Promise|undefined)}
   * @private
   */
  _chainOrCall(promise, fn) {
    if (promise?.then && typeof promise.then === "function") {
      return promise.then(() => fn());
    }
    return fn();
  }
  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */
  _chainOrCallHooks(promise, event) {
    let result = promise;
    const hooks = [];
    this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
      hookedCommand._lifeCycleHooks[event].forEach((callback) => {
        hooks.push({ hookedCommand, callback });
      });
    });
    if (event === "postAction") {
      hooks.reverse();
    }
    hooks.forEach((hookDetail) => {
      result = this._chainOrCall(result, () => {
        return hookDetail.callback(hookDetail.hookedCommand, this);
      });
    });
    return result;
  }
  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {Command} subCommand
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */
  _chainOrCallSubCommandHook(promise, subCommand, event) {
    let result = promise;
    if (this._lifeCycleHooks[event] !== void 0) {
      this._lifeCycleHooks[event].forEach((hook) => {
        result = this._chainOrCall(result, () => {
          return hook(this, subCommand);
        });
      });
    }
    return result;
  }
  /**
   * Process arguments in context of this command.
   * Returns action result, in case it is a promise.
   *
   * @private
   */
  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown);
    this._parseOptionsEnv();
    this._parseOptionsImplied();
    operands = operands.concat(parsed.operands);
    unknown = parsed.unknown;
    this.args = operands.concat(unknown);
    if (operands && this._findCommand(operands[0])) {
      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
    }
    if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
      return this._dispatchHelpCommand(operands[1]);
    }
    if (this._defaultCommandName) {
      this._outputHelpIfRequested(unknown);
      return this._dispatchSubcommand(
        this._defaultCommandName,
        operands,
        unknown
      );
    }
    if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
      this.help({ error: true });
    }
    this._outputHelpIfRequested(parsed.unknown);
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();
    const checkForUnknownOptions = () => {
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0]);
      }
    };
    const commandEvent = `command:${this.name()}`;
    if (this._actionHandler) {
      checkForUnknownOptions();
      this._processArguments();
      let promiseChain;
      promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
      promiseChain = this._chainOrCall(
        promiseChain,
        () => this._actionHandler(this.processedArgs)
      );
      if (this.parent) {
        promiseChain = this._chainOrCall(promiseChain, () => {
          this.parent.emit(commandEvent, operands, unknown);
        });
      }
      promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
      return promiseChain;
    }
    if (this.parent?.listenerCount(commandEvent)) {
      checkForUnknownOptions();
      this._processArguments();
      this.parent.emit(commandEvent, operands, unknown);
    } else if (operands.length) {
      if (this._findCommand("*")) {
        return this._dispatchSubcommand("*", operands, unknown);
      }
      if (this.listenerCount("command:*")) {
        this.emit("command:*", operands, unknown);
      } else if (this.commands.length) {
        this.unknownCommand();
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    } else if (this.commands.length) {
      checkForUnknownOptions();
      this.help({ error: true });
    } else {
      checkForUnknownOptions();
      this._processArguments();
    }
  }
  /**
   * Find matching command.
   *
   * @private
   * @return {Command | undefined}
   */
  _findCommand(name) {
    if (!name) return void 0;
    return this.commands.find(
      (cmd) => cmd._name === name || cmd._aliases.includes(name)
    );
  }
  /**
   * Return an option matching `arg` if any.
   *
   * @param {string} arg
   * @return {Option}
   * @package
   */
  _findOption(arg) {
    return this.options.find((option) => option.is(arg));
  }
  /**
   * Display an error message if a mandatory option does not have a value.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */
  _checkForMissingMandatoryOptions() {
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd.options.forEach((anOption) => {
        if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
          cmd.missingMandatoryOptionValue(anOption);
        }
      });
    });
  }
  /**
   * Display an error message if conflicting options are used together in this.
   *
   * @private
   */
  _checkForConflictingLocalOptions() {
    const definedNonDefaultOptions = this.options.filter((option) => {
      const optionKey = option.attributeName();
      if (this.getOptionValue(optionKey) === void 0) {
        return false;
      }
      return this.getOptionValueSource(optionKey) !== "default";
    });
    const optionsWithConflicting = definedNonDefaultOptions.filter(
      (option) => option.conflictsWith.length > 0
    );
    optionsWithConflicting.forEach((option) => {
      const conflictingAndDefined = definedNonDefaultOptions.find(
        (defined) => option.conflictsWith.includes(defined.attributeName())
      );
      if (conflictingAndDefined) {
        this._conflictingOption(option, conflictingAndDefined);
      }
    });
  }
  /**
   * Display an error message if conflicting options are used together.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */
  _checkForConflictingOptions() {
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd._checkForConflictingLocalOptions();
    });
  }
  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Side effects: modifies command by storing options. Does not reset state if called again.
   *
   * Examples:
   *
   *     argv => operands, unknown
   *     --known kkk op => [op], []
   *     op --known kkk => [op], []
   *     sub --unknown uuu op => [sub], [--unknown uuu op]
   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param {string[]} args
   * @return {{operands: string[], unknown: string[]}}
   */
  parseOptions(args) {
    const operands = [];
    const unknown = [];
    let dest = operands;
    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === "-";
    }
    const negativeNumberArg = (arg) => {
      if (!/^-(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(arg)) return false;
      return !this._getCommandAndAncestors().some(
        (cmd) => cmd.options.map((opt) => opt.short).some((short) => /^-\d$/.test(short))
      );
    };
    let activeVariadicOption = null;
    let activeGroup = null;
    let i = 0;
    while (i < args.length || activeGroup) {
      const arg = activeGroup ?? args[i++];
      activeGroup = null;
      if (arg === "--") {
        if (dest === unknown) dest.push(arg);
        dest.push(...args.slice(i));
        break;
      }
      if (activeVariadicOption && (!maybeOption(arg) || negativeNumberArg(arg))) {
        this.emit(`option:${activeVariadicOption.name()}`, arg);
        continue;
      }
      activeVariadicOption = null;
      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        if (option) {
          if (option.required) {
            const value = args[i++];
            if (value === void 0) this.optionMissingArgument(option);
            this.emit(`option:${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            if (i < args.length && (!maybeOption(args[i]) || negativeNumberArg(args[i]))) {
              value = args[i++];
            }
            this.emit(`option:${option.name()}`, value);
          } else {
            this.emit(`option:${option.name()}`);
          }
          activeVariadicOption = option.variadic ? option : null;
          continue;
        }
      }
      if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
        const option = this._findOption(`-${arg[1]}`);
        if (option) {
          if (option.required || option.optional && this._combineFlagAndOptionalValue) {
            this.emit(`option:${option.name()}`, arg.slice(2));
          } else {
            this.emit(`option:${option.name()}`);
            activeGroup = `-${arg.slice(2)}`;
          }
          continue;
        }
      }
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf("=");
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1));
          continue;
        }
      }
      if (dest === operands && maybeOption(arg) && !(this.commands.length === 0 && negativeNumberArg(arg))) {
        dest = unknown;
      }
      if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
        if (this._findCommand(arg)) {
          operands.push(arg);
          unknown.push(...args.slice(i));
          break;
        } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
          operands.push(arg, ...args.slice(i));
          break;
        } else if (this._defaultCommandName) {
          unknown.push(arg, ...args.slice(i));
          break;
        }
      }
      if (this._passThroughOptions) {
        dest.push(arg, ...args.slice(i));
        break;
      }
      dest.push(arg);
    }
    return { operands, unknown };
  }
  /**
   * Return an object containing local option values as key-value pairs.
   *
   * @return {object}
   */
  opts() {
    if (this._storeOptionsAsProperties) {
      const result = {};
      const len = this.options.length;
      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] = key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }
    return this._optionValues;
  }
  /**
   * Return an object containing merged local and global option values as key-value pairs.
   *
   * @return {object}
   */
  optsWithGlobals() {
    return this._getCommandAndAncestors().reduce(
      (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
      {}
    );
  }
  /**
   * Display error message and exit (or call exitOverride).
   *
   * @param {string} message
   * @param {object} [errorOptions]
   * @param {string} [errorOptions.code] - an id string representing the error
   * @param {number} [errorOptions.exitCode] - used with process.exit
   */
  error(message, errorOptions) {
    this._outputConfiguration.outputError(
      `${message}
`,
      this._outputConfiguration.writeErr
    );
    if (typeof this._showHelpAfterError === "string") {
      this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
    } else if (this._showHelpAfterError) {
      this._outputConfiguration.writeErr("\n");
      this.outputHelp({ error: true });
    }
    const config = errorOptions || {};
    const exitCode = config.exitCode || 1;
    const code = config.code || "commander.error";
    this._exit(exitCode, code, message);
  }
  /**
   * Apply any option related environment variables, if option does
   * not have a value from cli or client code.
   *
   * @private
   */
  _parseOptionsEnv() {
    this.options.forEach((option) => {
      if (option.envVar && option.envVar in import_node_process.default.env) {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
          this.getOptionValueSource(optionKey)
        )) {
          if (option.required || option.optional) {
            this.emit(`optionEnv:${option.name()}`, import_node_process.default.env[option.envVar]);
          } else {
            this.emit(`optionEnv:${option.name()}`);
          }
        }
      }
    });
  }
  /**
   * Apply any implied option values, if option is undefined or default value.
   *
   * @private
   */
  _parseOptionsImplied() {
    const dualHelper = new DualOptions(this.options);
    const hasCustomOptionValue = (optionKey) => {
      return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
    };
    this.options.filter(
      (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
        this.getOptionValue(option.attributeName()),
        option
      )
    ).forEach((option) => {
      Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
        this.setOptionValueWithSource(
          impliedKey,
          option.implied[impliedKey],
          "implied"
        );
      });
    });
  }
  /**
   * Argument `name` is missing.
   *
   * @param {string} name
   * @private
   */
  missingArgument(name) {
    const message = `error: missing required argument '${name}'`;
    this.error(message, { code: "commander.missingArgument" });
  }
  /**
   * `Option` is missing an argument.
   *
   * @param {Option} option
   * @private
   */
  optionMissingArgument(option) {
    const message = `error: option '${option.flags}' argument missing`;
    this.error(message, { code: "commander.optionMissingArgument" });
  }
  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param {Option} option
   * @private
   */
  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`;
    this.error(message, { code: "commander.missingMandatoryOptionValue" });
  }
  /**
   * `Option` conflicts with another option.
   *
   * @param {Option} option
   * @param {Option} conflictingOption
   * @private
   */
  _conflictingOption(option, conflictingOption) {
    const findBestOptionFromValue = (option2) => {
      const optionKey = option2.attributeName();
      const optionValue = this.getOptionValue(optionKey);
      const negativeOption = this.options.find(
        (target) => target.negate && optionKey === target.attributeName()
      );
      const positiveOption = this.options.find(
        (target) => !target.negate && optionKey === target.attributeName()
      );
      if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
        return negativeOption;
      }
      return positiveOption || option2;
    };
    const getErrorMessage = (option2) => {
      const bestOption = findBestOptionFromValue(option2);
      const optionKey = bestOption.attributeName();
      const source = this.getOptionValueSource(optionKey);
      if (source === "env") {
        return `environment variable '${bestOption.envVar}'`;
      }
      return `option '${bestOption.flags}'`;
    };
    const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
    this.error(message, { code: "commander.conflictingOption" });
  }
  /**
   * Unknown option `flag`.
   *
   * @param {string} flag
   * @private
   */
  unknownOption(flag) {
    if (this._allowUnknownOption) return;
    let suggestion = "";
    if (flag.startsWith("--") && this._showSuggestionAfterError) {
      let candidateFlags = [];
      let command = this;
      do {
        const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
        candidateFlags = candidateFlags.concat(moreFlags);
        command = command.parent;
      } while (command && !command._enablePositionalOptions);
      suggestion = suggestSimilar(flag, candidateFlags);
    }
    const message = `error: unknown option '${flag}'${suggestion}`;
    this.error(message, { code: "commander.unknownOption" });
  }
  /**
   * Excess arguments, more than expected.
   *
   * @param {string[]} receivedArgs
   * @private
   */
  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments) return;
    const expected = this.registeredArguments.length;
    const s = expected === 1 ? "" : "s";
    const received = receivedArgs.length;
    const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
    const details = receivedArgs.join(", ");
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${received}: ${details}.`;
    this.error(message, { code: "commander.excessArguments" });
  }
  /**
   * Unknown command.
   *
   * @private
   */
  unknownCommand() {
    const unknownName = this.args[0];
    let suggestion = "";
    if (this._showSuggestionAfterError) {
      const candidateNames = [];
      this.createHelp().visibleCommands(this).forEach((command) => {
        candidateNames.push(command.name());
        if (command.alias()) candidateNames.push(command.alias());
      });
      suggestion = suggestSimilar(unknownName, candidateNames);
    }
    const message = `error: unknown command '${unknownName}'${suggestion}`;
    this.error(message, { code: "commander.unknownCommand" });
  }
  /**
   * Get or set the program version.
   *
   * This method auto-registers the "-V, --version" option which will print the version number.
   *
   * You can optionally supply the flags and description to override the defaults.
   *
   * @param {string} [str]
   * @param {string} [flags]
   * @param {string} [description]
   * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
   */
  version(str, flags, description) {
    if (str === void 0) return this._version;
    this._version = str;
    flags = flags || "-V, --version";
    description = description || "output the version number";
    const versionOption = this.createOption(flags, description);
    this._versionOptionName = versionOption.attributeName();
    this._registerOption(versionOption);
    this.on("option:" + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}
`);
      this._exit(0, "commander.version", str);
    });
    return this;
  }
  /**
   * Set the description.
   *
   * @param {string} [str]
   * @param {object} [argsDescription]
   * @return {(string|Command)}
   */
  description(str, argsDescription) {
    if (str === void 0 && argsDescription === void 0)
      return this._description;
    this._description = str;
    if (argsDescription) {
      this._argsDescription = argsDescription;
    }
    return this;
  }
  /**
   * Set the summary. Used when listed as subcommand of parent.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  summary(str) {
    if (str === void 0) return this._summary;
    this._summary = str;
    return this;
  }
  /**
   * Set an alias for the command.
   *
   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
   *
   * @param {string} [alias]
   * @return {(string|Command)}
   */
  alias(alias) {
    if (alias === void 0) return this._aliases[0];
    let command = this;
    if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
      command = this.commands[this.commands.length - 1];
    }
    if (alias === command._name)
      throw new Error("Command alias can't be the same as its name");
    const matchingCommand = this.parent?._findCommand(alias);
    if (matchingCommand) {
      const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
      throw new Error(
        `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
      );
    }
    command._aliases.push(alias);
    return this;
  }
  /**
   * Set aliases for the command.
   *
   * Only the first alias is shown in the auto-generated help.
   *
   * @param {string[]} [aliases]
   * @return {(string[]|Command)}
   */
  aliases(aliases) {
    if (aliases === void 0) return this._aliases;
    aliases.forEach((alias) => this.alias(alias));
    return this;
  }
  /**
   * Set / get the command usage `str`.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  usage(str) {
    if (str === void 0) {
      if (this._usage) return this._usage;
      const args = this.registeredArguments.map((arg) => {
        return humanReadableArgName(arg);
      });
      return [].concat(
        this.options.length || this._helpOption !== null ? "[options]" : [],
        this.commands.length ? "[command]" : [],
        this.registeredArguments.length ? args : []
      ).join(" ");
    }
    this._usage = str;
    return this;
  }
  /**
   * Get or set the name of the command.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  name(str) {
    if (str === void 0) return this._name;
    this._name = str;
    return this;
  }
  /**
   * Set/get the help group heading for this subcommand in parent command's help.
   *
   * @param {string} [heading]
   * @return {Command | string}
   */
  helpGroup(heading) {
    if (heading === void 0) return this._helpGroupHeading ?? "";
    this._helpGroupHeading = heading;
    return this;
  }
  /**
   * Set/get the default help group heading for subcommands added to this command.
   * (This does not override a group set directly on the subcommand using .helpGroup().)
   *
   * @example
   * program.commandsGroup('Development Commands:);
   * program.command('watch')...
   * program.command('lint')...
   * ...
   *
   * @param {string} [heading]
   * @returns {Command | string}
   */
  commandsGroup(heading) {
    if (heading === void 0) return this._defaultCommandGroup ?? "";
    this._defaultCommandGroup = heading;
    return this;
  }
  /**
   * Set/get the default help group heading for options added to this command.
   * (This does not override a group set directly on the option using .helpGroup().)
   *
   * @example
   * program
   *   .optionsGroup('Development Options:')
   *   .option('-d, --debug', 'output extra debugging')
   *   .option('-p, --profile', 'output profiling information')
   *
   * @param {string} [heading]
   * @returns {Command | string}
   */
  optionsGroup(heading) {
    if (heading === void 0) return this._defaultOptionGroup ?? "";
    this._defaultOptionGroup = heading;
    return this;
  }
  /**
   * @param {Option} option
   * @private
   */
  _initOptionGroup(option) {
    if (this._defaultOptionGroup && !option.helpGroupHeading)
      option.helpGroup(this._defaultOptionGroup);
  }
  /**
   * @param {Command} cmd
   * @private
   */
  _initCommandGroup(cmd) {
    if (this._defaultCommandGroup && !cmd.helpGroup())
      cmd.helpGroup(this._defaultCommandGroup);
  }
  /**
   * Set the name of the command from script filename, such as process.argv[1],
   * or import.meta.filename.
   *
   * (Used internally and public although not documented in README.)
   *
   * @example
   * program.nameFromFilename(import.meta.filename);
   *
   * @param {string} filename
   * @return {Command}
   */
  nameFromFilename(filename) {
    this._name = import_node_path.default.basename(filename, import_node_path.default.extname(filename));
    return this;
  }
  /**
   * Get or set the directory for searching for executable subcommands of this command.
   *
   * @example
   * program.executableDir(import.meta.dirname);
   * // or
   * program.executableDir('subcommands');
   *
   * @param {string} [path]
   * @return {(string|null|Command)}
   */
  executableDir(path8) {
    if (path8 === void 0) return this._executableDir;
    this._executableDir = path8;
    return this;
  }
  /**
   * Return program help documentation.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
   * @return {string}
   */
  helpInformation(contextOptions) {
    const helper = this.createHelp();
    const context = this._getOutputContext(contextOptions);
    helper.prepareContext({
      error: context.error,
      helpWidth: context.helpWidth,
      outputHasColors: context.hasColors
    });
    const text = helper.formatHelp(this, helper);
    if (context.hasColors) return text;
    return this._outputConfiguration.stripColor(text);
  }
  /**
   * @typedef HelpContext
   * @type {object}
   * @property {boolean} error
   * @property {number} helpWidth
   * @property {boolean} hasColors
   * @property {function} write - includes stripColor if needed
   *
   * @returns {HelpContext}
   * @private
   */
  _getOutputContext(contextOptions) {
    contextOptions = contextOptions || {};
    const error = !!contextOptions.error;
    let baseWrite;
    let hasColors;
    let helpWidth;
    if (error) {
      baseWrite = (str) => this._outputConfiguration.writeErr(str);
      hasColors = this._outputConfiguration.getErrHasColors();
      helpWidth = this._outputConfiguration.getErrHelpWidth();
    } else {
      baseWrite = (str) => this._outputConfiguration.writeOut(str);
      hasColors = this._outputConfiguration.getOutHasColors();
      helpWidth = this._outputConfiguration.getOutHelpWidth();
    }
    const write = (str) => {
      if (!hasColors) str = this._outputConfiguration.stripColor(str);
      return baseWrite(str);
    };
    return { error, write, hasColors, helpWidth };
  }
  /**
   * Output help information for this command.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */
  outputHelp(contextOptions) {
    let deprecatedCallback;
    if (typeof contextOptions === "function") {
      deprecatedCallback = contextOptions;
      contextOptions = void 0;
    }
    const outputContext = this._getOutputContext(contextOptions);
    const eventContext = {
      error: outputContext.error,
      write: outputContext.write,
      command: this
    };
    this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
    this.emit("beforeHelp", eventContext);
    let helpInformation = this.helpInformation({ error: outputContext.error });
    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation);
      if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
        throw new Error("outputHelp callback must return a string or a Buffer");
      }
    }
    outputContext.write(helpInformation);
    if (this._getHelpOption()?.long) {
      this.emit(this._getHelpOption().long);
    }
    this.emit("afterHelp", eventContext);
    this._getCommandAndAncestors().forEach(
      (command) => command.emit("afterAllHelp", eventContext)
    );
  }
  /**
   * You can pass in flags and a description to customise the built-in help option.
   * Pass in false to disable the built-in help option.
   *
   * @example
   * program.helpOption('-?, --help' 'show help'); // customise
   * program.helpOption(false); // disable
   *
   * @param {(string | boolean)} flags
   * @param {string} [description]
   * @return {Command} `this` command for chaining
   */
  helpOption(flags, description) {
    if (typeof flags === "boolean") {
      if (flags) {
        if (this._helpOption === null) this._helpOption = void 0;
        if (this._defaultOptionGroup) {
          this._initOptionGroup(this._getHelpOption());
        }
      } else {
        this._helpOption = null;
      }
      return this;
    }
    this._helpOption = this.createOption(
      flags ?? "-h, --help",
      description ?? "display help for command"
    );
    if (flags || description) this._initOptionGroup(this._helpOption);
    return this;
  }
  /**
   * Lazy create help option.
   * Returns null if has been disabled with .helpOption(false).
   *
   * @returns {(Option | null)} the help option
   * @package
   */
  _getHelpOption() {
    if (this._helpOption === void 0) {
      this.helpOption(void 0, void 0);
    }
    return this._helpOption;
  }
  /**
   * Supply your own option to use for the built-in help option.
   * This is an alternative to using helpOption() to customise the flags and description etc.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addHelpOption(option) {
    this._helpOption = option;
    this._initOptionGroup(option);
    return this;
  }
  /**
   * Output help information and exit.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */
  help(contextOptions) {
    this.outputHelp(contextOptions);
    let exitCode = Number(import_node_process.default.exitCode ?? 0);
    if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
      exitCode = 1;
    }
    this._exit(exitCode, "commander.help", "(outputHelp)");
  }
  /**
   * // Do a little typing to coordinate emit and listener for the help text events.
   * @typedef HelpTextEventContext
   * @type {object}
   * @property {boolean} error
   * @property {Command} command
   * @property {function} write
   */
  /**
   * Add additional text to be displayed with the built-in help.
   *
   * Position is 'before' or 'after' to affect just this command,
   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
   *
   * @param {string} position - before or after built-in help
   * @param {(string | Function)} text - string to add, or a function returning a string
   * @return {Command} `this` command for chaining
   */
  addHelpText(position, text) {
    const allowedValues = ["beforeAll", "before", "after", "afterAll"];
    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    const helpEvent = `${position}Help`;
    this.on(helpEvent, (context) => {
      let helpStr;
      if (typeof text === "function") {
        helpStr = text({ error: context.error, command: context.command });
      } else {
        helpStr = text;
      }
      if (helpStr) {
        context.write(`${helpStr}
`);
      }
    });
    return this;
  }
  /**
   * Output help information if help flags specified
   *
   * @param {Array} args - array of options to search for help flags
   * @private
   */
  _outputHelpIfRequested(args) {
    const helpOption = this._getHelpOption();
    const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
    if (helpRequested) {
      this.outputHelp();
      this._exit(0, "commander.helpDisplayed", "(outputHelp)");
    }
  }
};
function incrementNodeInspectorPort(args) {
  return args.map((arg) => {
    if (!arg.startsWith("--inspect")) {
      return arg;
    }
    let debugOption;
    let debugHost = "127.0.0.1";
    let debugPort = "9229";
    let match;
    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      debugOption = match[1];
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
      debugOption = match[1];
      if (/^\d+$/.test(match[3])) {
        debugPort = match[3];
      } else {
        debugHost = match[3];
      }
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
      debugOption = match[1];
      debugHost = match[3];
      debugPort = match[4];
    }
    if (debugOption && debugPort !== "0") {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
    }
    return arg;
  });
}
function useColor() {
  if (import_node_process.default.env.NO_COLOR || import_node_process.default.env.FORCE_COLOR === "0" || import_node_process.default.env.FORCE_COLOR === "false")
    return false;
  if (import_node_process.default.env.FORCE_COLOR || import_node_process.default.env.CLICOLOR_FORCE !== void 0)
    return true;
  return void 0;
}

// node_modules/.pnpm/commander@15.0.0/node_modules/commander/index.js
var program = new Command();

// packages/ai-core/dist/artefacts.js
var ARTIFACT_TYPES = [
  "javascript",
  "typescript",
  "test",
  "json",
  "yaml",
  "openapi",
  "sql",
  "infrastructure",
  "documentation",
  "requirements",
  "architecture",
  "gherkin",
  "step-definition",
  "page-object",
  "test-case"
];

// packages/ai-core/dist/errors.js
var AIEvaluationError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "AIEvaluationError";
    this.code = code;
  }
};

// packages/ai-core/dist/policy.js
var DEFAULT_EXECUTION_POLICY = {
  samples: 1,
  concurrency: 1,
  timeoutMs: 3e4,
  retry: {
    maxInfrastructureRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 1e4,
    backoffMultiplier: 2,
    jitter: true
  },
  failFast: false
};

// packages/ai-core/dist/adapter.js
var ADAPTER_CAPABILITY_KEYS = [
  "text",
  "images",
  "streaming",
  "structuredOutput",
  "toolCalling",
  "multiTurn",
  "usage",
  "contentSafetyMetadata",
  "seed"
];

// packages/ai-core/dist/registry.js
function validateAdapterCapabilities(capabilities) {
  for (const key of ADAPTER_CAPABILITY_KEYS) {
    if (typeof capabilities[key] !== "boolean") {
      throw new AIEvaluationError("ADAPTER_CAPABILITY_ERROR", `Capability "${key}" must be a boolean`);
    }
  }
}
var InMemoryAdapterRegistry = class {
  adapters = /* @__PURE__ */ new Map();
  register(adapter) {
    if (!adapter.id || !adapter.id.trim()) {
      throw new AIEvaluationError("CONFIG_ERROR", "Adapter id is required");
    }
    if (this.adapters.has(adapter.id)) {
      throw new AIEvaluationError("CONFIG_ERROR", `Adapter "${adapter.id}" is already registered`);
    }
    this.adapters.set(adapter.id, adapter);
  }
  has(id) {
    return this.adapters.has(id);
  }
  get(id) {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new AIEvaluationError("ADAPTER_NOT_FOUND", `Adapter "${id}" is not registered`);
    }
    return adapter;
  }
  list() {
    return [...this.adapters.values()].map((adapter) => ({
      id: adapter.id,
      name: adapter.name,
      version: adapter.version
    }));
  }
  async requireCapability(id, capability) {
    const adapter = this.get(id);
    const capabilities = await adapter.capabilities();
    validateAdapterCapabilities(capabilities);
    if (!capabilities[capability]) {
      throw new AIEvaluationError("ADAPTER_CAPABILITY_ERROR", `Adapter "${id}" does not support ${capability}`);
    }
  }
};
function createAdapterRegistry() {
  return new InMemoryAdapterRegistry();
}

// packages/ai-core/dist/evaluator.js
var BUILTIN_QUALITY_SCORE_MIN = 0;
var BUILTIN_QUALITY_SCORE_MAX = 1;
function assertBuiltinQualityScore(score2) {
  if (!Number.isFinite(score2) || score2 < BUILTIN_QUALITY_SCORE_MIN || score2 > BUILTIN_QUALITY_SCORE_MAX) {
    throw new AIEvaluationError("EVALUATOR_ERROR", "Built-in quality scores must be between 0.0 and 1.0");
  }
}
function createEvaluatorResult(evaluator, result) {
  if (result.score !== void 0) {
    assertBuiltinQualityScore(result.score);
  }
  if (result.status === "error" && !result.error) {
    throw new AIEvaluationError("EVALUATOR_ERROR", "Evaluator infrastructure errors must include an error");
  }
  if ((result.status === "pass" || result.status === "fail") && result.error) {
    throw new AIEvaluationError("EVALUATOR_ERROR", "Behavioural pass/fail results must not carry an infrastructure error");
  }
  return {
    evaluatorId: evaluator.id,
    evaluatorVersion: evaluator.version,
    ...result
  };
}

// packages/ai-core/dist/evaluator-registry.js
var InMemoryEvaluatorRegistry = class {
  evaluators = /* @__PURE__ */ new Map();
  register(evaluator) {
    if (!evaluator.id || !evaluator.id.trim()) {
      throw new AIEvaluationError("CONFIG_ERROR", "Evaluator id is required");
    }
    if (!evaluator.version || !evaluator.version.trim()) {
      throw new AIEvaluationError("CONFIG_ERROR", `Evaluator "${evaluator.id}" requires a version`);
    }
    if (this.evaluators.has(evaluator.id)) {
      throw new AIEvaluationError("CONFIG_ERROR", `Evaluator "${evaluator.id}" is already registered`);
    }
    this.evaluators.set(evaluator.id, evaluator);
  }
  has(id) {
    return this.evaluators.has(id);
  }
  get(id) {
    const evaluator = this.evaluators.get(id);
    if (!evaluator) {
      throw new AIEvaluationError("EVALUATOR_ERROR", `Evaluator "${id}" is not registered`);
    }
    return evaluator;
  }
  resolve(binding) {
    const evaluator = this.get(binding.id);
    if (evaluator.kind !== binding.type) {
      throw new AIEvaluationError("CONFIG_ERROR", `Evaluator "${binding.id}" is ${evaluator.kind}, not ${binding.type}`);
    }
    return evaluator;
  }
  list() {
    return [...this.evaluators.values()].map((evaluator) => ({
      id: evaluator.id,
      name: evaluator.name,
      version: evaluator.version,
      kind: evaluator.kind
    }));
  }
};
function createEvaluatorRegistry() {
  return new InMemoryEvaluatorRegistry();
}

// packages/ai-core/dist/aggregation.js
var STATUS_PRECEDENCE = ["error", "fail", "review", "pass"];
function percentile(values, p) {
  const sorted = finiteNumbers(values).sort(ascending);
  if (sorted.length === 0) {
    return void 0;
  }
  if (p <= 0) {
    return sorted[0];
  }
  if (p >= 1) {
    return sorted[sorted.length - 1];
  }
  const rank = 1 + (sorted.length - 1) * p;
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const lowerValue = sorted[lower - 1];
  const upperValue = sorted[upper - 1];
  return lowerValue + (rank - lower) * (upperValue - lowerValue);
}
function summarizeStatuses(statuses) {
  const counts = {
    count: statuses.length,
    passCount: statuses.filter((status) => status === "pass").length,
    failCount: statuses.filter((status) => status === "fail").length,
    errorCount: statuses.filter((status) => status === "error").length,
    reviewCount: statuses.filter((status) => status === "review").length
  };
  const behavioural = counts.passCount + counts.failCount;
  return behavioural === 0 ? counts : { ...counts, passRate: counts.passCount / behavioural };
}
function summarizeNumbers(values) {
  const sorted = finiteNumbers(values).sort(ascending);
  if (sorted.length === 0) {
    return { count: 0 };
  }
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
  return {
    count: sorted.length,
    mean,
    median: percentile(sorted, 0.5),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    standardDeviation: Math.sqrt(variance),
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99)
  };
}
function aggregateStatus(statuses) {
  for (const status of STATUS_PRECEDENCE) {
    if (statuses.includes(status)) {
      return status;
    }
  }
  return "review";
}
function aggregateSample(sample) {
  const statuses = sample.evaluatorResults.map((result) => result.status).filter(isAggregateStatus);
  return {
    sampleId: sample.sampleId,
    caseId: sample.caseId,
    sampleIndex: sample.sampleIndex,
    status: statuses.length === 0 ? sample.status : aggregateStatus(statuses),
    counts: summarizeStatuses(statuses),
    scores: summarizeNumbers(sample.evaluatorResults.map((result) => result.score))
  };
}
function aggregateCase(caseId, samples) {
  const ordered = [...samples].sort(bySample);
  const aggregated = ordered.map(aggregateSample);
  return {
    caseId,
    counts: summarizeStatuses(aggregated.map((sample) => sample.status)),
    scores: summarizeNumbers(ordered.flatMap((sample) => sample.evaluatorResults.map((result) => result.score))),
    latency: summarizeNumbers(ordered.map((sample) => sample.execution.timing.latencyMs)),
    samples: aggregated
  };
}
function aggregateSuite(samples) {
  const caseIds = [...new Set(samples.map((sample) => sample.caseId))].sort((left, right) => left.localeCompare(right));
  const cases = caseIds.map((caseId) => aggregateCase(caseId, samples.filter((sample) => sample.caseId === caseId)));
  const ordered = [...samples].sort(bySample);
  return {
    counts: summarizeStatuses(cases.flatMap((item) => item.samples.map((sample) => sample.status))),
    scores: summarizeNumbers(ordered.flatMap((sample) => sample.evaluatorResults.map((result) => result.score))),
    latency: summarizeNumbers(ordered.map((sample) => sample.execution.timing.latencyMs)),
    cases
  };
}
function finiteNumbers(values) {
  return values.filter((value) => typeof value === "number" && Number.isFinite(value));
}
function ascending(left, right) {
  return left - right;
}
function bySample(left, right) {
  return left.sampleIndex - right.sampleIndex || left.sampleId.localeCompare(right.sampleId);
}
function isAggregateStatus(status) {
  return status === "pass" || status === "fail" || status === "error" || status === "review";
}

// packages/ai-core/dist/baseline-compare.js
var DEFAULT_COMPARISON_THRESHOLDS = {
  scoreDelta: 0.05,
  passRateDelta: 0.05,
  latencyMsDelta: 0
};
function createBaseline(input) {
  const aggregate = aggregateSuite(input.samples);
  const metrics = {};
  if (aggregate.counts.passRate !== void 0) {
    metrics.passRate = aggregate.counts.passRate;
  }
  if (aggregate.scores.mean !== void 0) {
    metrics.meanScore = aggregate.scores.mean;
  }
  if (aggregate.latency.p95 !== void 0) {
    metrics.p95LatencyMs = aggregate.latency.p95;
  }
  const caseResults = {};
  for (const item of aggregate.cases) {
    const result = { status: aggregateStatus(item.samples.map((sample) => sample.status)) };
    if (item.scores.mean !== void 0) {
      result.score = item.scores.mean;
    }
    caseResults[item.caseId] = result;
  }
  return {
    id: input.id,
    name: input.name,
    createdAt: input.createdAt,
    suiteId: input.suiteId,
    suiteVersion: input.suiteVersion,
    datasetHash: input.datasetHash,
    sourceRunId: input.sourceRunId,
    metrics,
    caseResults
  };
}
function compareBaselines(baseline, current, thresholds = DEFAULT_COMPARISON_THRESHOLDS) {
  if (baseline.suiteId !== current.suiteId || baseline.datasetHash !== current.datasetHash) {
    return {
      verdict: "not comparable",
      comparable: false,
      reason: baseline.suiteId !== current.suiteId ? "suite id differs" : "dataset hash differs",
      cases: [],
      metrics: []
    };
  }
  const caseIds = [.../* @__PURE__ */ new Set([...Object.keys(baseline.caseResults), ...Object.keys(current.caseResults)])].sort((left, right) => left.localeCompare(right));
  const cases = caseIds.map((caseId) => compareCase(caseId, baseline.caseResults[caseId], current.caseResults[caseId], thresholds));
  const metrics = [
    compareMetric("passRate", baseline.metrics.passRate, current.metrics.passRate, thresholds.passRateDelta, "lower"),
    compareMetric("meanScore", baseline.metrics.meanScore, current.metrics.meanScore, thresholds.scoreDelta, "lower"),
    compareMetric("p95LatencyMs", baseline.metrics.p95LatencyMs, current.metrics.p95LatencyMs, thresholds.latencyMsDelta, "higher")
  ].filter((item) => item !== void 0);
  return {
    verdict: overallVerdict(cases, metrics),
    comparable: true,
    reason: "dataset hash matches",
    cases,
    metrics
  };
}
function compareCase(caseId, baseline, current, thresholds) {
  if (!baseline) {
    return { caseId, verdict: "new case", ...current ? { current } : {}, reason: "case is not in the baseline" };
  }
  if (!current) {
    return { caseId, verdict: "removed case", baseline, reason: "case is not in the current run" };
  }
  if (baseline.status === "error" || baseline.status === "review" || current.status === "error" || current.status === "review") {
    return { caseId, verdict: "not comparable", baseline, current, reason: "a case result is error or review" };
  }
  if (baseline.status === "pass" && current.status === "fail") {
    return { caseId, verdict: "regression", baseline, current, reason: "case changed from pass to fail" };
  }
  if (baseline.status === "fail" && current.status === "pass") {
    return { caseId, verdict: "improvement", baseline, current, reason: "case changed from fail to pass" };
  }
  if (baseline.score === void 0 || current.score === void 0) {
    return { caseId, verdict: "not comparable", baseline, current, reason: "a case score is missing" };
  }
  if (baseline.score - current.score > thresholds.scoreDelta) {
    return { caseId, verdict: "regression", baseline, current, reason: "score fell by more than the threshold" };
  }
  if (current.score - baseline.score > thresholds.scoreDelta) {
    return { caseId, verdict: "improvement", baseline, current, reason: "score rose by more than the threshold" };
  }
  return { caseId, verdict: "no material change", baseline, current, reason: "score stayed within the threshold" };
}
function compareMetric(name, baseline, current, threshold, worse) {
  if (baseline === void 0 || current === void 0) {
    return void 0;
  }
  const regressed = worse === "lower" ? baseline - current > threshold : current - baseline > threshold;
  const improved = worse === "lower" ? current - baseline > threshold : baseline - current > threshold;
  if (regressed) {
    return { name, verdict: "regression", baseline, current, reason: `${name} moved beyond the threshold` };
  }
  if (improved) {
    return { name, verdict: "improvement", baseline, current, reason: `${name} moved beyond the threshold` };
  }
  return { name, verdict: "no material change", baseline, current, reason: `${name} stayed within the threshold` };
}
function overallVerdict(cases, metrics) {
  const verdicts = [...cases.map((item) => item.verdict), ...metrics.map((item) => item.verdict)];
  if (verdicts.includes("regression")) {
    return "regression";
  }
  if (verdicts.includes("not comparable")) {
    return "not comparable";
  }
  if (verdicts.includes("improvement")) {
    return "improvement";
  }
  return "no material change";
}

// packages/ai-core/dist/telemetry.js
var TELEMETRY_EVENTS = [
  "run.started",
  "run.completed",
  "case.started",
  "case.completed",
  "sample.started",
  "sample.completed",
  "adapter.call",
  "evaluator.completed",
  "gate.completed"
];
var noopTelemetry = { emit() {
} };
var EVENT_NAMES = new Set(TELEMETRY_EVENTS);
function sanitizeTelemetry(input) {
  const record = input;
  if (typeof record.name !== "string" || !EVENT_NAMES.has(record.name) || typeof record.runId !== "string" || typeof record.suiteId !== "string") {
    return void 0;
  }
  const event = { name: record.name, runId: record.runId, suiteId: record.suiteId };
  copyString(event, record, "caseId");
  copyString(event, record, "sampleId");
  copyString(event, record, "adapterId");
  copyString(event, record, "evaluatorId");
  copyString(event, record, "status");
  copyNumber(event, record, "latencyMs");
  copyNumber(event, record, "attempt");
  return event;
}
function emitTelemetry(sink, event) {
  const safe = sanitizeTelemetry(event);
  if (safe) {
    (sink ?? noopTelemetry).emit(safe);
  }
}
function createTelemetryCollector() {
  const events = [];
  return {
    events,
    sink: {
      emit(event) {
        const safe = sanitizeTelemetry(event);
        if (safe) {
          events.push(safe);
        }
      }
    }
  };
}
function copyString(event, record, key) {
  if (typeof record[key] === "string") {
    event[key] = record[key];
  }
}
function copyNumber(event, record, key) {
  if (typeof record[key] === "number" && Number.isFinite(record[key])) {
    event[key] = record[key];
  }
}

// packages/ai-core/dist/controls.js
var CONTROL_ALIGNMENT_STATEMENT = "Control mappings record evidence alignment. They are not a certification of compliance.";

// packages/ai-core/dist/usage.js
function summarizeUsage(samples, costTable) {
  const input = definedNumbers(samples.map((sample) => sample.execution.usage?.inputTokens));
  const output = definedNumbers(samples.map((sample) => sample.execution.usage?.outputTokens));
  const total = definedNumbers(samples.map((sample) => sample.execution.usage?.totalTokens));
  const samplesWithUsage = samples.filter((sample) => sample.execution.usage !== void 0).length;
  const priced = costTable === void 0 ? void 0 : estimatedCost(samples, costTable);
  return {
    requests: samples.reduce((sum, sample) => sum + (sample.turns && sample.turns.length > 0 ? sample.turns.length : 1), 0),
    ...input === void 0 ? {} : { inputTokens: input },
    ...output === void 0 ? {} : { outputTokens: output },
    ...total === void 0 ? {} : { totalTokens: total },
    samplesWithUsage,
    samplesMissingUsage: samples.length - samplesWithUsage,
    ...priced?.estimatedCost === void 0 ? {} : { estimatedCost: priced.estimatedCost, currency: costTable?.currency, costTableVersion: costTable?.version },
    unpricedModels: priced?.unpricedModels ?? []
  };
}
function budgetTokenTotal(summary, field) {
  if (summary.samplesMissingUsage > 0 || summary[field] === void 0) {
    return void 0;
  }
  return summary[field];
}
function definedNumbers(values) {
  const present = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (present.length === 0) {
    return void 0;
  }
  return present.reduce((sum, value) => sum + value, 0);
}
function estimatedCost(samples, costTable) {
  let cost = 0;
  const unpricedModels = [];
  let complete = samples.length > 0;
  for (const sample of samples) {
    const model = sample.execution.model?.deployment ?? sample.execution.model?.providerModel ?? sample.execution.model?.requested ?? "unknown";
    const price = costTable.prices.find((item) => item.match === model);
    const usage = sample.execution.usage;
    if (!price || usage?.inputTokens === void 0 || usage.outputTokens === void 0) {
      complete = false;
      unpricedModels.push(model);
      continue;
    }
    cost += (usage.inputTokens * price.inputPerMillion + usage.outputTokens * price.outputPerMillion) / 1e6;
  }
  return { ...complete ? { estimatedCost: cost } : {}, unpricedModels };
}

// packages/ai-core/dist/quality-gate.js
var CRITICAL_CASE_TAG = "critical";
async function evaluateQualityGate(input) {
  const checks = collectChecks(input.gate, input.samples, input.cases ?? [], input.costTable);
  const decision = {
    status: checks.some((check) => check.status === "fail") ? "fail" : "pass",
    checks,
    criticalSecurityFailure: checks.some((check) => check.id === "security.maximumCriticalViolations" && check.status === "fail")
  };
  const evidence = { name: "quality-gate", body: decision };
  if (input.evidence) {
    evidence.ref = await input.evidence.write({ name: evidence.name, body: decision });
  }
  return { decision, evidence };
}
function collectChecks(gate, samples, cases, costTable) {
  const suite = aggregateSuite(samples);
  const checks = [];
  if (gate.overall?.minimumScore !== void 0) {
    checks.push(atLeast("overall.minimumScore", suite.scores.mean, gate.overall.minimumScore, "overall score"));
  }
  if (gate.overall?.minimumPassRate !== void 0) {
    checks.push(atLeast("overall.minimumPassRate", suite.counts.passRate, gate.overall.minimumPassRate, "overall pass rate"));
  }
  for (const evaluatorId of Object.keys(gate.evaluators ?? {}).sort((left, right) => left.localeCompare(right))) {
    const limits = gate.evaluators?.[evaluatorId];
    if (!limits) {
      continue;
    }
    const stats = evaluatorStats(samples, evaluatorId);
    if (limits.minimumScore !== void 0) {
      checks.push(atLeast(`evaluators.${evaluatorId}.minimumScore`, stats.scores.mean, limits.minimumScore, `${evaluatorId} score`));
    }
    if (limits.maximumScore !== void 0) {
      checks.push(atMost(`evaluators.${evaluatorId}.maximumScore`, stats.scores.mean, limits.maximumScore, `${evaluatorId} score`));
    }
    if (limits.minimumPassRate !== void 0) {
      checks.push(atLeast(`evaluators.${evaluatorId}.minimumPassRate`, stats.counts.passRate, limits.minimumPassRate, `${evaluatorId} pass rate`));
    }
  }
  if (gate.criticalCases) {
    checks.push(criticalPassRate(samples, cases, gate.criticalCases.minimumPassRate));
  }
  if (gate.security) {
    checks.push(atMost("security.maximumCriticalViolations", violationCount(samples, "critical"), gate.security.maximumCriticalViolations, "critical security violations"));
    if (gate.security.maximumHighViolations !== void 0) {
      checks.push(atMost("security.maximumHighViolations", violationCount(samples, "high"), gate.security.maximumHighViolations, "high security violations"));
    }
  }
  if (gate.performance?.p95LatencyMs !== void 0) {
    checks.push(atMost("performance.p95LatencyMs", suite.latency.p95, gate.performance.p95LatencyMs, "P95 latency"));
  }
  if (gate.budget) {
    const usage = summarizeUsage(samples, costTable);
    if (gate.budget.maximumTotalTokens !== void 0) {
      checks.push(atMost("budget.maximumTotalTokens", budgetTokenTotal(usage, "totalTokens"), gate.budget.maximumTotalTokens, "total tokens"));
    }
    if (gate.budget.maximumInputTokens !== void 0) {
      checks.push(atMost("budget.maximumInputTokens", budgetTokenTotal(usage, "inputTokens"), gate.budget.maximumInputTokens, "input tokens"));
    }
    if (gate.budget.maximumOutputTokens !== void 0) {
      checks.push(atMost("budget.maximumOutputTokens", budgetTokenTotal(usage, "outputTokens"), gate.budget.maximumOutputTokens, "output tokens"));
    }
    if (gate.budget.maximumRequests !== void 0) {
      checks.push(atMost("budget.maximumRequests", usage.requests, gate.budget.maximumRequests, "request count"));
    }
    if (gate.budget.maximumEstimatedCost !== void 0) {
      checks.push(atMost("budget.maximumEstimatedCost", usage.estimatedCost, gate.budget.maximumEstimatedCost, "estimated cost"));
    }
  }
  if (gate.stability?.minimumPassRate !== void 0) {
    checks.push(atLeast("stability.minimumPassRate", suite.counts.passRate, gate.stability.minimumPassRate, "stability pass rate"));
  }
  if (gate.stability?.maximumScoreStdDev !== void 0) {
    checks.push(atMost("stability.maximumScoreStdDev", suite.scores.standardDeviation, gate.stability.maximumScoreStdDev, "score standard deviation"));
  }
  if (gate.infrastructure?.maximumErrorRate !== void 0) {
    const errorRate = suite.counts.count === 0 ? void 0 : suite.counts.errorCount / suite.counts.count;
    checks.push(atMost("infrastructure.maximumErrorRate", errorRate, gate.infrastructure.maximumErrorRate, "infrastructure error rate"));
  }
  return checks;
}
function criticalPassRate(samples, cases, minimumPassRate) {
  const criticalIds = new Set(cases.filter((item) => item.tags?.includes(CRITICAL_CASE_TAG)).map((item) => item.id));
  if (criticalIds.size === 0) {
    return { id: "criticalCases.minimumPassRate", status: "fail", limit: minimumPassRate, reason: "no critical cases were present" };
  }
  const aggregate = aggregateSuite(samples.filter((sample) => criticalIds.has(sample.caseId)));
  return atLeast("criticalCases.minimumPassRate", aggregate.counts.passRate, minimumPassRate, "critical case pass rate");
}
function evaluatorStats(samples, evaluatorId) {
  const results = samples.flatMap((sample) => sample.evaluatorResults.filter((result) => result.evaluatorId === evaluatorId));
  return {
    counts: summarizeStatuses(results.map((result) => result.status).filter(isAggregateStatus2)),
    scores: summarizeNumbers(results.map((result) => result.score))
  };
}
function violationCount(samples, severity) {
  return samples.reduce((count, sample) => count + sample.evaluatorResults.filter((result) => isViolation(result, severity)).length, 0);
}
function isViolation(result, severity) {
  return result.status === "fail" && result.severity === severity;
}
function atLeast(id, actual, limit, label) {
  if (actual === void 0) {
    return { id, status: "fail", limit, reason: `${label} is unavailable` };
  }
  const passed = actual >= limit;
  return { id, status: passed ? "pass" : "fail", actual, limit, reason: passed ? `${label} met the minimum` : `${label} is below the minimum` };
}
function atMost(id, actual, limit, label) {
  if (actual === void 0) {
    return { id, status: "fail", limit, reason: `${label} is unavailable` };
  }
  const passed = actual <= limit;
  return { id, status: passed ? "pass" : "fail", actual, limit, reason: passed ? `${label} met the maximum` : `${label} is above the maximum` };
}
function isAggregateStatus2(status) {
  return status === "pass" || status === "fail" || status === "error" || status === "review";
}

// packages/ai-core/dist/orchestration/ids.js
var import_node_crypto = require("node:crypto");
function createRunId(now = Date.now()) {
  const time = now.toString(16).padStart(12, "0");
  const entropy = (0, import_node_crypto.randomBytes)(8).toString("hex");
  return `${time}${entropy}`;
}
function createSampleId(runId, caseId, sampleIndex) {
  return `${runId}:${caseId}:${sampleIndex}`;
}

// packages/ai-core/dist/orchestration/policy.js
var INFRASTRUCTURE_RETRY_CODES = /* @__PURE__ */ new Set([
  "RATE_LIMIT_ERROR",
  "NETWORK_ERROR",
  "TIMEOUT_ERROR",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_RESPONSE_ERROR"
]);
function mergeExecutionPolicy(...layers) {
  return layers.reduce((policy, layer) => {
    if (!layer) {
      return policy;
    }
    return {
      ...policy,
      ...layer,
      retry: {
        ...policy.retry,
        ...layer.retry
      }
    };
  }, DEFAULT_EXECUTION_POLICY);
}
function isInfrastructureRetry(result) {
  if (result.status !== "failed" || !result.error?.retryable) {
    return false;
  }
  return INFRASTRUCTURE_RETRY_CODES.has(result.error.code);
}
function retryDelayMs(policy, retryIndex) {
  const grown = policy.retry.initialDelayMs * policy.retry.backoffMultiplier ** retryIndex;
  const capped = Math.min(policy.retry.maxDelayMs, grown);
  if (!policy.retry.jitter) {
    return capped;
  }
  return Math.round(capped * (0.5 + Math.random() * 0.5));
}

// packages/ai-core/dist/orchestration/plan.js
function planCaseSamples(evaluationCase, runId, policy) {
  return Array.from({ length: policy.samples }, (_value, sampleIndex) => ({
    evaluationCase,
    sampleIndex,
    sampleId: createSampleId(runId, evaluationCase.id, sampleIndex),
    policy
  }));
}
function planSuite(suite, runId, cli) {
  return suite.cases.flatMap((evaluationCase) => {
    const policy = mergeExecutionPolicy(suite.defaults?.execution, evaluationCase.execution, cli);
    return planCaseSamples(evaluationCase, runId, policy);
  });
}

// packages/ai-core/dist/orchestration/run.js
var import_node_crypto2 = require("node:crypto");
var silentLogger = {
  debug() {
  },
  info() {
  },
  warn() {
  },
  error() {
  }
};
function defaultSleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function withResponseFormat(evaluationCase, request) {
  const schema = jsonSchemaFor(evaluationCase);
  const explicitJson = evaluationCase.metadata?.json === true || evaluationCase.target.options?.json === true;
  if (!schema && !explicitJson) {
    return request;
  }
  const responseFormat = schema ? { type: "json", schema } : { type: "json" };
  return { ...request, responseFormat };
}
function withTools(evaluationCase, request) {
  const formatted = withResponseFormat(evaluationCase, request);
  const tools = toolDefinitions(evaluationCase.metadata?.tools);
  const toolChoice = toolChoiceFor(evaluationCase.metadata?.toolChoice);
  return {
    ...formatted,
    ...tools ? { tools } : {},
    ...toolChoice ? { toolChoice } : {}
  };
}
function toolDefinitions(value) {
  if (!Array.isArray(value)) {
    return void 0;
  }
  const tools = value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }
    const tool = item;
    const hostedType = tool.type === "web_search" || tool.type === "web_search_preview" || tool.type === "file_search" ? tool.type : void 0;
    if (hostedType) {
      const vectorStoreIds = Array.isArray(tool.vectorStoreIds) ? tool.vectorStoreIds.filter((id) => typeof id === "string" && id.length > 0) : [];
      const hosted = {
        name: typeof tool.name === "string" && tool.name.trim().length > 0 ? tool.name : hostedType,
        type: hostedType,
        ...vectorStoreIds.length > 0 ? { vectorStoreIds } : {}
      };
      return [hosted];
    }
    if (typeof tool.name !== "string" || tool.name.trim().length === 0) {
      return [];
    }
    return [{
      name: tool.name,
      type: "function",
      ...typeof tool.description === "string" ? { description: tool.description } : {},
      ...tool.parameters && typeof tool.parameters === "object" && !Array.isArray(tool.parameters) ? { parameters: tool.parameters } : {}
    }];
  });
  return tools.length > 0 ? tools : void 0;
}
function toolHandlers(evaluationCase) {
  const tools = evaluationCase.metadata?.tools;
  if (!Array.isArray(tools)) {
    return /* @__PURE__ */ new Map();
  }
  const handlers = /* @__PURE__ */ new Map();
  for (const item of tools) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const tool = item;
    if (typeof tool.name === "string" && tool.name.trim().length > 0 && typeof tool.execute === "function") {
      handlers.set(tool.name, tool.execute);
    }
  }
  return handlers;
}
async function applyToolResults(evaluationCase, result) {
  const calls = result.toolCalls;
  if (!calls || calls.length === 0) {
    return result;
  }
  const handlers = toolHandlers(evaluationCase);
  if (handlers.size === 0) {
    return result;
  }
  const toolCalls = await Promise.all(calls.map(async (call) => {
    const handler = handlers.get(call.name);
    if (!handler) {
      return call;
    }
    try {
      const value = await handler(call.arguments);
      return { ...call, result: value, status: "completed" };
    } catch {
      return { ...call, status: "failed" };
    }
  }));
  return { ...result, toolCalls };
}
function toolChoiceFor(value) {
  if (value === "auto" || value === "none" || value === "required") {
    return value;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const choice = value;
  if (choice.type === "tool" && typeof choice.name === "string" && choice.name.trim().length > 0) {
    return { type: "tool", name: choice.name };
  }
  return void 0;
}
function jsonSchemaFor(evaluationCase) {
  if (evaluationCase.expectations?.expectedSchema) {
    return evaluationCase.expectations.expectedSchema;
  }
  for (const binding of evaluationCase.evaluators) {
    const schema = binding.config?.schema;
    if (binding.id === "json-schema" && schema && typeof schema === "object" && !Array.isArray(schema)) {
      return schema;
    }
  }
  return void 0;
}
function scoredExecutionStatus(status) {
  return status === "completed" || status === "blocked" ? "review" : "error";
}
function requestHash(request) {
  return (0, import_node_crypto2.createHash)("sha256").update(JSON.stringify(request)).digest("hex");
}
function timeoutResult(adapterId, startedAt, timeoutMs) {
  return {
    id: `${adapterId}-timeout`,
    adapterId,
    status: "failed",
    output: {},
    timing: {
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + timeoutMs).toISOString(),
      latencyMs: timeoutMs
    },
    error: { code: "TIMEOUT_ERROR", message: "Sample exceeded timeoutMs", retryable: true }
  };
}
async function executeSampleAttempt(adapter, request, context, timeoutMs) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(timeoutResult(context.metadata?.adapterId, context.startedAt, timeoutMs)), timeoutMs);
  });
  try {
    return await Promise.race([adapter.execute(request, context), timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runWorker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  };
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, () => runWorker());
  await Promise.all(workers);
  return results;
}
async function runEvaluation(options) {
  const now = options.now ?? (() => (/* @__PURE__ */ new Date()).toISOString());
  const sleep = options.sleep ?? defaultSleep;
  const run = {
    runId: (options.createRunId ?? createRunId)(),
    suiteId: options.suite.id,
    startedAt: now()
  };
  const planned = planSuite(options.suite, run.runId, options.cli);
  const adapterIds = [...new Set(options.suite.cases.map((evaluationCase) => evaluationCase.target.adapter))];
  const health = [];
  for (const adapterId of adapterIds) {
    const adapter = options.registry.get(adapterId);
    const profile = options.suite.cases.find((evaluationCase) => evaluationCase.target.adapter === adapterId)?.target.profile;
    const checked = await adapter.healthCheck({ ...profile ? { profile } : {}, signal: options.signal });
    health.push({ adapterId, health: checked });
    if (checked.status !== "healthy") {
      const detail = checked.checks?.filter((check) => check.status === "fail").map((check) => check.message).filter((message) => Boolean(message)).join("; ");
      throw new AIEvaluationError("PROVIDER_UNAVAILABLE", detail ? `Adapter "${adapterId}" failed its health check: ${detail}` : `Adapter "${adapterId}" failed its health check`);
    }
  }
  emitTelemetry(options.telemetry, { name: "run.started", runId: run.runId, suiteId: run.suiteId });
  const byCase = /* @__PURE__ */ new Map();
  for (const sample of planned) {
    const group = byCase.get(sample.evaluationCase.id) ?? [];
    group.push(sample);
    byCase.set(sample.evaluationCase.id, group);
  }
  const samples = [];
  for (const group of byCase.values()) {
    if (options.signal?.aborted) {
      break;
    }
    const caseId = group[0]?.evaluationCase.id ?? "unknown";
    emitTelemetry(options.telemetry, { name: "case.started", runId: run.runId, suiteId: run.suiteId, caseId });
    const concurrency = group[0]?.policy.concurrency ?? 1;
    const records = await mapPool(group, concurrency, (plannedSample) => executePlannedSample(plannedSample, options, run, sleep, now));
    samples.push(...records);
    emitTelemetry(options.telemetry, {
      name: "case.completed",
      runId: run.runId,
      suiteId: run.suiteId,
      caseId,
      status: records.some((record) => record.sample.status === "error") ? "error" : "review"
    });
    if (group[0]?.policy.failFast && records.some((record) => record.sample.status === "error")) {
      break;
    }
  }
  emitTelemetry(options.telemetry, { name: "run.completed", runId: run.runId, suiteId: run.suiteId, status: samples.some((record) => record.sample.status === "error") ? "error" : "completed" });
  return { run, health, samples };
}
async function executePlannedSample(plannedSample, options, run, sleep, now) {
  const evaluationCase = plannedSample.evaluationCase;
  const adapter = options.registry.get(evaluationCase.target.adapter);
  const artifacts = [];
  const evidence = {
    async write(artifact) {
      const ref = `${plannedSample.sampleId}:${artifacts.length}`;
      artifacts.push({ ref, name: artifact.name, body: artifact.body });
      return ref;
    }
  };
  emitTelemetry(options.telemetry, { name: "sample.started", runId: run.runId, suiteId: run.suiteId, caseId: evaluationCase.id, sampleId: plannedSample.sampleId });
  const attempts = [];
  const requestBase = {
    ...evaluationCase.target.model ? { model: evaluationCase.target.model } : {},
    ...evaluationCase.target.deployment ? { deployment: evaluationCase.target.deployment } : {}
  };
  if (evaluationCase.conversation && evaluationCase.conversation.turns.length > 0) {
    const history = [];
    const turns = [];
    let finalResult;
    for (const [index, turn] of evaluationCase.conversation.turns.entries()) {
      history.push(...turn.messages);
      const request2 = withTools(evaluationCase, { ...requestBase, messages: history.map((message) => ({ ...message })) });
      const executed2 = await executeAndContinue(request2, adapter, plannedSample, options, run, evidence, sleep, now);
      attempts.push(...executed2.attempts);
      finalResult = executed2.result;
      const responseText = executed2.result.output.text ?? "";
      turns.push({
        turnId: turn.id,
        index,
        messages: history.map((message) => ({ ...message })),
        execution: executed2.result,
        evaluatorResults: []
      });
      await evidence.write({
        name: `turn-${turn.id}`,
        body: { turnId: turn.id, index, request: turn.messages, history: history.map((message) => ({ ...message })), response: responseText, status: executed2.result.status }
      });
      if (executed2.result.status !== "completed") {
        break;
      }
      history.push({ role: "assistant", content: responseText });
    }
    if (!finalResult) {
      throw new AIEvaluationError("INTERNAL_ERROR", `Sample "${plannedSample.sampleId}" produced no result`);
    }
    emitTelemetry(options.telemetry, {
      name: "sample.completed",
      runId: run.runId,
      suiteId: run.suiteId,
      caseId: evaluationCase.id,
      sampleId: plannedSample.sampleId,
      status: scoredExecutionStatus(finalResult.status)
    });
    const transcript = turns.map((turn) => turn.execution.output.text ?? "").filter((text) => text.length > 0).join("\n");
    return {
      plan: plannedSample,
      attempts,
      evidence: artifacts,
      sample: {
        sampleId: plannedSample.sampleId,
        sampleIndex: plannedSample.sampleIndex,
        caseId: evaluationCase.id,
        requestHash: requestHash({ ...requestBase, messages: history }),
        execution: { ...finalResult, output: { ...finalResult.output, text: transcript, messages: history.map((message) => ({ ...message })) } },
        turns,
        evaluatorResults: [],
        status: scoredExecutionStatus(finalResult.status),
        startedAt: attempts[0]?.result.timing.startedAt ?? now(),
        completedAt: finalResult.timing.completedAt
      }
    };
  }
  const request = withTools(evaluationCase, { ...requestBase, messages: evaluationCase.input.messages });
  const executed = await executeAndContinue(request, adapter, plannedSample, options, run, evidence, sleep, now);
  emitTelemetry(options.telemetry, {
    name: "sample.completed",
    runId: run.runId,
    suiteId: run.suiteId,
    caseId: evaluationCase.id,
    sampleId: plannedSample.sampleId,
    status: scoredExecutionStatus(executed.result.status),
    latencyMs: executed.result.timing.latencyMs
  });
  return {
    plan: plannedSample,
    attempts: executed.attempts,
    evidence: artifacts,
    sample: {
      sampleId: plannedSample.sampleId,
      sampleIndex: plannedSample.sampleIndex,
      caseId: evaluationCase.id,
      requestHash: requestHash(request),
      execution: executed.result,
      evaluatorResults: [],
      status: scoredExecutionStatus(executed.result.status),
      startedAt: executed.attempts[0]?.result.timing.startedAt ?? now(),
      completedAt: executed.result.timing.completedAt
    }
  };
}
async function executeAndContinue(request, adapter, plannedSample, options, run, evidence, sleep, now) {
  const executed = await runAttempts(request, adapter, plannedSample, options, run, evidence, sleep, now);
  const answered = (executed.result.toolCalls ?? []).filter((call) => call.result !== void 0);
  if (executed.result.status !== "completed" || answered.length === 0) {
    return executed;
  }
  const followUp = {
    ...request,
    toolChoice: "none",
    messages: [
      ...request.messages,
      {
        role: "assistant",
        content: executed.result.output.text ?? "",
        metadata: {
          toolCalls: answered.map((call) => ({ id: call.id, name: call.name, arguments: call.arguments }))
        }
      },
      ...answered.map((call) => ({
        role: "tool",
        name: call.name,
        toolCallId: call.id,
        content: typeof call.result === "string" ? call.result : JSON.stringify(call.result)
      }))
    ]
  };
  const continued = await runAttempts(followUp, adapter, plannedSample, options, run, evidence, sleep, now);
  const usage = combineUsage(executed.result.usage, continued.result.usage);
  return {
    result: mergeToolFollowUp(executed.result, continued.result, usage),
    attempts: [...executed.attempts, ...continued.attempts]
  };
}
function mergeToolFollowUp(first, second, usage) {
  return {
    ...second,
    toolCalls: first.toolCalls,
    citations: second.citations ?? first.citations,
    ...usage ? { usage } : {},
    timing: {
      startedAt: first.timing.startedAt,
      completedAt: second.timing.completedAt,
      latencyMs: first.timing.latencyMs + second.timing.latencyMs
    }
  };
}
function combineUsage(left, right) {
  if (!left && !right) {
    return void 0;
  }
  const field = (name) => {
    const first = left?.[name];
    const second = right?.[name];
    if (typeof first !== "number" && typeof second !== "number") {
      return void 0;
    }
    return (typeof first === "number" ? first : 0) + (typeof second === "number" ? second : 0);
  };
  const inputTokens = field("inputTokens");
  const outputTokens = field("outputTokens");
  const totalTokens = field("totalTokens");
  const cachedInputTokens = field("cachedInputTokens");
  const reasoningTokens = field("reasoningTokens");
  return {
    ...inputTokens === void 0 ? {} : { inputTokens },
    ...outputTokens === void 0 ? {} : { outputTokens },
    ...totalTokens === void 0 ? {} : { totalTokens },
    ...cachedInputTokens === void 0 ? {} : { cachedInputTokens },
    ...reasoningTokens === void 0 ? {} : { reasoningTokens }
  };
}
async function runAttempts(request, adapter, plannedSample, options, run, evidence, sleep, now) {
  const attempts = [];
  const maxAttempts = plannedSample.policy.retry.maxInfrastructureRetries + 1;
  let finalResult;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      finalResult = timeoutResult(adapter.id, now(), 0);
      finalResult.error = { code: "TIMEOUT_ERROR", message: "Execution aborted", retryable: false };
      attempts.push({ attempt, result: finalResult, retried: false });
      break;
    }
    const startedAt = now();
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    options.signal?.addEventListener("abort", onAbort);
    const timer = setTimeout(() => controller.abort(), plannedSample.policy.timeoutMs);
    const context = {
      runId: run.runId,
      suiteId: run.suiteId,
      caseId: plannedSample.evaluationCase.id,
      sampleId: plannedSample.sampleId,
      startedAt,
      deadline: new Date(Date.parse(startedAt) + plannedSample.policy.timeoutMs).toISOString(),
      signal: controller.signal,
      evidence,
      logger: silentLogger,
      metadata: { adapterId: adapter.id }
    };
    let result;
    try {
      result = await applyToolResults(plannedSample.evaluationCase, await executeSampleAttempt(adapter, request, context, plannedSample.policy.timeoutMs));
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    }
    const retry = attempt < maxAttempts && isInfrastructureRetry(result);
    attempts.push({ attempt, result, retried: retry });
    emitTelemetry(options.telemetry, {
      name: "adapter.call",
      runId: run.runId,
      suiteId: run.suiteId,
      caseId: plannedSample.evaluationCase.id,
      sampleId: plannedSample.sampleId,
      adapterId: adapter.id,
      status: result.status,
      latencyMs: result.timing.latencyMs,
      attempt
    });
    finalResult = result;
    if (!retry) {
      break;
    }
    await evidence.write({ name: `retry-${attempt}`, body: { sampleId: plannedSample.sampleId, attempt, code: result.error?.code } });
    await sleep(retryDelayMs(plannedSample.policy, attempt - 1));
  }
  if (!finalResult) {
    throw new AIEvaluationError("INTERNAL_ERROR", `Sample "${plannedSample.sampleId}" produced no result`);
  }
  return { result: finalResult, attempts };
}

// packages/ai-datasets/dist/canonical.js
var import_node_crypto3 = require("node:crypto");
function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortValue(item));
  }
  if (value && typeof value === "object") {
    const source = value;
    const sorted = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortValue(source[key]);
    }
    return sorted;
  }
  return value;
}
function canonicalizeDataset(value) {
  return JSON.stringify(sortValue(value));
}
function hashDataset(value) {
  return (0, import_node_crypto3.createHash)("sha256").update(canonicalizeDataset(value)).digest("hex");
}

// packages/ai-datasets/dist/errors.js
var DatasetValidationError = class extends Error {
  issues;
  constructor(issues) {
    const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    super(detail || "Dataset validation failed");
    this.name = "DatasetValidationError";
    this.issues = issues;
  }
};

// packages/ai-datasets/dist/load.js
var import_promises = require("node:fs/promises");
var import_node_path2 = __toESM(require("node:path"), 1);
var import_yaml = __toESM(require_dist(), 1);

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path8, errorMaps, issueData } = params;
  const fullPath = [...path8, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path8, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path8;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// packages/ai-datasets/dist/schemas.js
var nonEmpty = external_exports.string().min(1);
var score = external_exports.number().min(0).max(1);
var envName = external_exports.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "must be an environment variable name, not a secret value");
var metadata = external_exports.record(external_exports.unknown()).optional();
var aiContentPartSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("text"), text: external_exports.string() }).strict(),
  external_exports.object({
    type: external_exports.literal("image"),
    uri: external_exports.string().optional(),
    mediaType: external_exports.string().optional(),
    dataRef: external_exports.string().optional()
  }).strict()
]);
var aiMessageSchema = external_exports.object({
  role: external_exports.enum(["system", "developer", "user", "assistant", "tool"]),
  content: external_exports.union([external_exports.string(), external_exports.array(aiContentPartSchema).min(1)]),
  name: external_exports.string().optional(),
  toolCallId: external_exports.string().optional(),
  metadata
}).strict();
var evaluationTargetSchema = external_exports.object({
  adapter: nonEmpty,
  profile: external_exports.string().optional(),
  model: external_exports.string().optional(),
  deployment: external_exports.string().optional(),
  options: external_exports.record(external_exports.unknown()).optional()
}).strict();
var executionPolicySchema = external_exports.object({
  samples: external_exports.number().int().min(1),
  concurrency: external_exports.number().int().min(1),
  timeoutMs: external_exports.number().int().positive(),
  retry: external_exports.object({
    maxInfrastructureRetries: external_exports.number().int().min(0),
    initialDelayMs: external_exports.number().int().min(0),
    maxDelayMs: external_exports.number().int().min(0),
    backoffMultiplier: external_exports.number().positive(),
    jitter: external_exports.boolean()
  }).strict(),
  failFast: external_exports.boolean()
}).strict();
var evaluatorBindingSchema = external_exports.object({
  id: nonEmpty,
  type: external_exports.enum(["deterministic", "model", "human", "platform"]),
  threshold: score.optional(),
  judge: external_exports.object({
    adapter: nonEmpty,
    profile: external_exports.string().optional()
  }).strict().optional(),
  config: external_exports.record(external_exports.unknown()).optional()
}).strict();
var qualityGateSchema = external_exports.object({
  overall: external_exports.object({
    minimumScore: score.optional(),
    minimumPassRate: score.optional()
  }).strict().optional(),
  evaluators: external_exports.record(external_exports.object({
    minimumScore: score.optional(),
    maximumScore: score.optional(),
    minimumPassRate: score.optional()
  }).strict()).optional(),
  criticalCases: external_exports.object({ minimumPassRate: score }).strict().optional(),
  security: external_exports.object({
    maximumCriticalViolations: external_exports.number().int().min(0),
    maximumHighViolations: external_exports.number().int().min(0).optional()
  }).strict().optional(),
  performance: external_exports.object({ p95LatencyMs: external_exports.number().int().positive().optional() }).strict().optional(),
  budget: external_exports.object({
    maximumTotalTokens: external_exports.number().int().min(0).optional(),
    maximumInputTokens: external_exports.number().int().min(0).optional(),
    maximumOutputTokens: external_exports.number().int().min(0).optional(),
    maximumRequests: external_exports.number().int().min(0).optional(),
    maximumEstimatedCost: external_exports.number().min(0).optional()
  }).strict().optional(),
  stability: external_exports.object({
    minimumPassRate: score.optional(),
    maximumScoreStdDev: external_exports.number().min(0).optional()
  }).strict().optional(),
  infrastructure: external_exports.object({ maximumErrorRate: score.optional() }).strict().optional()
}).strict();
var evaluationExpectationsSchema = external_exports.object({
  requiredFacts: external_exports.array(external_exports.string()).optional(),
  prohibitedClaims: external_exports.array(external_exports.string()).optional(),
  requiredSources: external_exports.array(external_exports.string()).optional(),
  forbiddenSources: external_exports.array(external_exports.string()).optional(),
  expectedSchema: external_exports.record(external_exports.unknown()).optional(),
  expectedTools: external_exports.array(external_exports.string()).optional(),
  forbiddenTools: external_exports.array(external_exports.string()).optional()
}).strict();
var evaluationCaseSchema = external_exports.object({
  id: nonEmpty,
  name: nonEmpty,
  description: external_exports.string().optional(),
  tags: external_exports.array(external_exports.string()).optional(),
  target: evaluationTargetSchema,
  input: external_exports.object({
    messages: external_exports.array(aiMessageSchema).min(1),
    variables: external_exports.record(external_exports.unknown()).optional()
  }).strict(),
  expectations: evaluationExpectationsSchema.optional(),
  evaluators: external_exports.array(evaluatorBindingSchema).min(1),
  conversation: external_exports.object({
    turns: external_exports.array(external_exports.object({
      id: nonEmpty,
      messages: external_exports.array(aiMessageSchema).min(1),
      evaluators: external_exports.array(evaluatorBindingSchema).optional()
    }).strict()).min(1)
  }).strict().optional(),
  execution: executionPolicySchema.partial().optional(),
  artefact: external_exports.object({ type: external_exports.enum(ARTIFACT_TYPES) }).strict().optional(),
  metadata
}).strict();
var evaluationSuiteSchema = external_exports.object({
  id: nonEmpty,
  name: nonEmpty,
  version: nonEmpty,
  description: external_exports.string().optional(),
  cases: external_exports.array(evaluationCaseSchema).min(1),
  defaults: external_exports.object({
    target: evaluationTargetSchema.partial().optional(),
    execution: executionPolicySchema.partial().optional(),
    evaluators: external_exports.array(evaluatorBindingSchema).optional()
  }).strict().optional(),
  qualityGate: qualityGateSchema,
  costTable: external_exports.object({
    version: nonEmpty,
    currency: nonEmpty,
    prices: external_exports.array(external_exports.object({
      match: nonEmpty,
      inputPerMillion: external_exports.number().min(0),
      outputPerMillion: external_exports.number().min(0)
    }).strict()).min(1)
  }).strict().optional(),
  metadata
}).strict().superRefine((suite, context) => {
  const seen = /* @__PURE__ */ new Set();
  suite.cases.forEach((evaluationCase, index) => {
    if (seen.has(evaluationCase.id)) {
      context.addIssue({
        code: external_exports.ZodIssueCode.custom,
        path: ["cases", index, "id"],
        message: `Duplicate case id "${evaluationCase.id}"`
      });
    }
    seen.add(evaluationCase.id);
  });
});
var baselineCaseResultSchema = external_exports.object({
  status: external_exports.enum(["pass", "fail", "error", "review"]),
  score: score.optional()
}).strict();
var baselineSchema = external_exports.object({
  id: nonEmpty,
  name: nonEmpty,
  createdAt: external_exports.string().datetime(),
  suiteId: nonEmpty,
  suiteVersion: nonEmpty,
  datasetHash: external_exports.string().regex(/^[a-f0-9]{64}$/),
  sourceRunId: nonEmpty,
  metrics: external_exports.record(external_exports.number()),
  caseResults: external_exports.record(baselineCaseResultSchema),
  metadata
}).strict();
var adapterProfileSchema = external_exports.object({
  endpointEnv: envName.optional(),
  deploymentEnv: envName.optional(),
  credential: external_exports.object({
    type: external_exports.enum(["api-key", "default"]),
    apiKeyEnv: envName.optional()
  }).strict().optional()
}).strict();
var aiConfigurationSchema = external_exports.object({
  ai: external_exports.object({
    adapters: external_exports.record(external_exports.object({
      profiles: external_exports.record(adapterProfileSchema)
    }).strict()),
    targets: external_exports.record(external_exports.object({
      adapter: nonEmpty,
      profile: external_exports.string().optional()
    }).strict()).optional(),
    judges: external_exports.record(external_exports.object({
      adapter: nonEmpty,
      profile: external_exports.string().optional()
    }).strict()).optional()
  }).strict()
}).strict();

// packages/ai-datasets/dist/load.js
function issuesFromZod(error) {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.map(String).join(".") : "<root>",
    message: issue.message
  }));
}
function parseWith(schema, value) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new DatasetValidationError(issuesFromZod(parsed.error));
  }
  return parsed.data;
}
function parseEvaluationCase(value) {
  return parseWith(evaluationCaseSchema, value);
}
function parseEvaluationSuite(value) {
  return parseWith(evaluationSuiteSchema, value);
}
function parseBaseline(value) {
  return parseWith(baselineSchema, value);
}
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    throw new DatasetValidationError([{ path: "<root>", message }]);
  }
}
function parseYaml(text) {
  try {
    return (0, import_yaml.parse)(text, { maxAliasCount: 50, uniqueKeys: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid YAML";
    throw new DatasetValidationError([{ path: "<root>", message }]);
  }
}
function loadSuiteFromJson(text) {
  const suite = parseEvaluationSuite(parseJson(text));
  return { suite, datasetHash: hashDataset(suite) };
}
function loadSuiteFromYaml(text) {
  const suite = parseEvaluationSuite(parseYaml(text));
  return { suite, datasetHash: hashDataset(suite) };
}
async function loadSuiteFile(filePath) {
  const text = await (0, import_promises.readFile)(filePath, "utf8");
  const extension = import_node_path2.default.extname(filePath).toLowerCase();
  if (extension === ".json") {
    return loadSuiteFromJson(text);
  }
  if (extension === ".yaml" || extension === ".yml") {
    return loadSuiteFromYaml(text);
  }
  throw new DatasetValidationError([
    { path: "<root>", message: `Unsupported dataset extension "${extension || "(none)"}". Use .json, .yaml, or .yml` }
  ]);
}

// packages/ai-adapter-azure-openai/dist/profile.js
var AZURE_ADAPTER_ID = "azure-openai";
var AZURE_JUDGE_ADAPTER_ID = "azure-openai-judge";
var AZURE_ADAPTER_VERSION = "0.1.0";
var defaultAzureProfile = {
  endpointEnv: "AZURE_OPENAI_ENDPOINT",
  deploymentEnv: "AZURE_OPENAI_DEPLOYMENT",
  credential: { type: "api-key", apiKeyEnv: "AZURE_OPENAI_API_KEY" },
  executionApi: "responses",
  timeoutMs: 3e4
};
var judgeAzureProfile = {
  endpointEnv: "AZURE_OPENAI_ENDPOINT",
  deploymentEnv: "AZURE_OPENAI_JUDGE_DEPLOYMENT",
  credential: { type: "api-key", apiKeyEnv: "AZURE_OPENAI_API_KEY" },
  executionApi: "responses",
  timeoutMs: 3e4
};
var ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
function assertAzureProfile(profile) {
  if (!profile.endpoint && !profile.endpointEnv) {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter requires an endpoint or endpointEnv");
  }
  if (profile.endpointEnv !== void 0 && !ENV_NAME.test(profile.endpointEnv)) {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter endpointEnv must be an environment variable name");
  }
  if (profile.deploymentEnv !== void 0 && !ENV_NAME.test(profile.deploymentEnv)) {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter deploymentEnv must be an environment variable name");
  }
  if (!profile.deployment && !profile.deploymentEnv) {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter requires a deployment or deploymentEnv");
  }
  if (profile.timeoutMs !== void 0 && (!Number.isInteger(profile.timeoutMs) || profile.timeoutMs < 1)) {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter timeoutMs must be a positive integer");
  }
  if (profile.maxRetries !== void 0 && (!Number.isInteger(profile.maxRetries) || profile.maxRetries < 0)) {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter maxRetries must be a non-negative integer");
  }
  if (profile.executionApi !== void 0 && profile.executionApi !== "responses" && profile.executionApi !== "chat-completions") {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter executionApi must be responses or chat-completions");
  }
  if (profile.credential?.type !== "api-key" || !ENV_NAME.test(profile.credential.apiKeyEnv)) {
    throw new AIEvaluationError("CONFIG_ERROR", "Azure adapter apiKeyEnv must be an environment variable name");
  }
}

// packages/ai-adapter-azure-openai/dist/map.js
var SECRET_OPTION_KEYS = /* @__PURE__ */ new Set(["api-key", "api_key", "authorization"]);
function mapAzureCall(request, target) {
  const deployment = request.deployment?.trim() || target.deployment;
  const requested = request.model?.trim() || deployment;
  if (target.executionApi === "chat-completions") {
    return { path: "/openai/v1/chat/completions", deployment, requested, body: chatBody(request, deployment) };
  }
  return { path: "/openai/v1/responses", deployment, requested, body: responsesBody(request, deployment) };
}
function mapAzureOutput(body) {
  if (!body || typeof body !== "object") {
    return { status: "completed", ...typeof body === "string" && body ? { text: body } : {} };
  }
  const record = body;
  if (Array.isArray(record.choices)) {
    return mapChatOutput(record);
  }
  return mapResponsesOutput(record);
}
function providerError(body) {
  if (!body || typeof body !== "object") {
    return typeof body === "string" && body ? { message: body } : {};
  }
  const error = body.error;
  if (!error || typeof error !== "object") {
    return { providerCode: asString(body.code) };
  }
  const record = error;
  return { message: asString(record.message), providerCode: asString(record.code) };
}
function requestHasImage(request) {
  return request.messages.some((message) => Array.isArray(message.content) && message.content.some((part) => part.type === "image"));
}
function responsesBody(request, deployment) {
  return omitEmpty({
    model: deployment,
    input: request.messages.flatMap(responsesInput),
    temperature: request.temperature,
    top_p: request.topP,
    max_output_tokens: request.maxOutputTokens,
    seed: request.seed,
    tools: request.tools?.map(responsesTool),
    tool_choice: responsesToolChoice(request.toolChoice),
    text: responseTextFormat(request),
    ...safeOptions(request.providerOptions)
  });
}
function chatBody(request, deployment) {
  return omitEmpty({
    model: deployment,
    messages: request.messages.map(chatMessage),
    temperature: request.temperature,
    top_p: request.topP,
    max_completion_tokens: request.maxOutputTokens,
    seed: request.seed,
    tools: request.tools?.flatMap((tool) => tool.type === "web_search" || tool.type === "web_search_preview" || tool.type === "file_search" ? [] : [{
      type: "function",
      function: omitEmpty({ name: tool.name, description: tool.description, parameters: tool.parameters })
    }]),
    tool_choice: chatToolChoice(request.toolChoice),
    response_format: chatResponseFormat(request),
    ...safeOptions(request.providerOptions)
  });
}
function responsesInput(message) {
  if (message.role === "tool") {
    return [{ type: "function_call_output", call_id: message.toolCallId ?? message.name ?? "tool", output: messageText(message) }];
  }
  const calls = messageToolCalls(message);
  if (message.role === "assistant" && calls.length > 0) {
    const text = messageText(message);
    return [
      ...text ? [{ role: "assistant", content: text }] : [],
      ...calls.map((call) => ({
        type: "function_call",
        call_id: call.id,
        name: call.name,
        arguments: typeof call.arguments === "string" ? call.arguments : JSON.stringify(call.arguments ?? {})
      }))
    ];
  }
  return [{ role: message.role, content: messageText(message) }];
}
function chatMessage(message) {
  const calls = messageToolCalls(message);
  if (message.role === "assistant" && calls.length > 0) {
    const text = messageText(message);
    return omitEmpty({
      role: "assistant",
      content: text || null,
      tool_calls: calls.map((call) => ({
        id: call.id,
        type: "function",
        function: {
          name: call.name,
          arguments: typeof call.arguments === "string" ? call.arguments : JSON.stringify(call.arguments ?? {})
        }
      }))
    });
  }
  return omitEmpty({
    role: message.role === "developer" ? "system" : message.role,
    content: messageText(message),
    ...message.role === "tool" ? { tool_call_id: message.toolCallId ?? message.name } : {}
  });
}
function messageToolCalls(message) {
  const value = message.metadata?.toolCalls;
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }
    const call = item;
    if (typeof call.name !== "string" || call.name.trim().length === 0) {
      return [];
    }
    return [{ id: typeof call.id === "string" && call.id.length > 0 ? call.id : call.name, name: call.name, arguments: call.arguments }];
  });
}
function messageText(message) {
  if (typeof message.content === "string") {
    return message.content;
  }
  return message.content.filter((part) => part.type === "text").map((part) => part.text).join("");
}
function mapResponsesOutput(record) {
  const output = Array.isArray(record.output) ? record.output : [];
  const texts = [];
  const citations = [];
  const toolCalls = [];
  let structured;
  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const entry = item;
    if (entry.type === "function_call") {
      toolCalls.push(toolCall(entry.call_id ?? entry.id, entry.name, entry.arguments));
      continue;
    }
    citations.push(...citationsFrom(entry.annotations));
    const content = Array.isArray(entry.content) ? entry.content : [];
    for (const part of content) {
      if (!part || typeof part !== "object") {
        continue;
      }
      const block = part;
      if (block.type === "output_json") {
        structured = block.json ?? parseJson2(asString(block.text));
      }
      const text2 = asString(block.text) ?? asString(block.refusal);
      if (text2) {
        texts.push(text2);
      }
      citations.push(...citationsFrom(block.annotations));
    }
  }
  const text = texts.join("") || asString(record.output_text);
  if (structured === void 0) {
    structured = parseJson2(text);
  }
  const safety = safetyFrom(record.content_filter_results);
  const incomplete = record.incomplete_details && typeof record.incomplete_details === "object" ? asString(record.incomplete_details.reason) : void 0;
  const providerStatus = asString(record.status);
  return {
    id: asString(record.id),
    status: outputStatus(providerStatus, safety, incomplete),
    ...text ? { text } : {},
    ...structured !== void 0 ? { structured } : {},
    ...toolCalls.length > 0 ? { toolCalls } : {},
    ...citations.length > 0 ? { citations } : {},
    ...normalizeUsage(record.usage) ? { usage: normalizeUsage(record.usage) } : {},
    ...safety.length > 0 ? { safety } : {},
    finishReason: incomplete ?? (providerStatus === "incomplete" ? "incomplete" : "stop"),
    ...asString(record.model) ? { providerModel: asString(record.model) } : {}
  };
}
function mapChatOutput(record) {
  const choice = Array.isArray(record.choices) && record.choices[0] && typeof record.choices[0] === "object" ? record.choices[0] : void 0;
  const message = choice?.message && typeof choice.message === "object" ? choice.message : void 0;
  const content = message?.content;
  let text = "";
  let structured;
  if (typeof content === "string") {
    text = content;
    structured = parseJson2(content);
  } else if (Array.isArray(content)) {
    const texts = [];
    for (const part of content) {
      if (!part || typeof part !== "object") {
        continue;
      }
      const block = part;
      if (typeof block.json === "object" && block.json !== null) {
        structured = block.json;
      }
      const partText = asString(block.text);
      if (partText) {
        texts.push(partText);
      }
    }
    text = texts.join("");
  }
  const toolCalls = Array.isArray(message?.tool_calls) ? message.tool_calls.map((call) => {
    const recordCall = call;
    const fn = recordCall.function && typeof recordCall.function === "object" ? recordCall.function : void 0;
    return toolCall(recordCall.id, fn?.name ?? recordCall.name, fn?.arguments ?? recordCall.arguments);
  }) : [];
  const citations = [
    ...citationsFrom(Array.isArray(content) ? content.flatMap((part) => part && typeof part === "object" ? part.annotations ?? [] : []) : []),
    ...citationsFromContext(message?.context)
  ];
  const safety = safetyFrom(choice?.content_filter_results ?? record.content_filter_results);
  const finishReason = asString(choice?.finish_reason) ?? "stop";
  return {
    id: asString(record.id),
    status: finishReason === "content_filter" || safety.some((item) => item.action === "block") ? "blocked" : finishReason === "length" ? "incomplete" : "completed",
    ...text ? { text } : {},
    ...structured !== void 0 ? { structured } : {},
    ...toolCalls.length > 0 ? { toolCalls } : {},
    ...citations.length > 0 ? { citations } : {},
    ...normalizeUsage(record.usage) ? { usage: normalizeUsage(record.usage) } : {},
    ...safety.length > 0 ? { safety } : {},
    finishReason,
    ...asString(record.model) ? { providerModel: asString(record.model) } : {}
  };
}
function outputStatus(providerStatus, safety, incomplete) {
  if (safety.some((item) => item.action === "block")) {
    return "blocked";
  }
  if (providerStatus === "incomplete" || incomplete) {
    return "incomplete";
  }
  if (providerStatus === "failed") {
    return "failed";
  }
  return "completed";
}
function toolCall(id, name, rawArguments) {
  const toolName = asString(name) ?? "tool";
  const parsed = typeof rawArguments === "string" ? parseJson2(rawArguments) ?? rawArguments : rawArguments;
  return {
    id: asString(id) ?? toolName,
    name: toolName,
    ...parsed !== void 0 ? { arguments: parsed } : {},
    status: "requested"
  };
}
function citationsFromContext(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  const citations = value.citations;
  if (!Array.isArray(citations)) {
    return [];
  }
  return citations.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const citation = item;
    return [{
      ...asString(citation.id) ? { id: asString(citation.id) } : {},
      ...asString(citation.title) ? { title: asString(citation.title) } : {},
      ...asString(citation.url) ?? asString(citation.uri) ? { uri: asString(citation.url) ?? asString(citation.uri) } : {}
    }];
  });
}
function citationsFrom(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const annotation = item;
    if (annotation.type !== "url_citation" && annotation.type !== "file_citation") {
      return [];
    }
    const nested = annotation.type === "url_citation" ? asRecord(annotation.url_citation) : asRecord(annotation.file_citation);
    const source = { ...annotation, ...nested ?? {} };
    const uri = asString(source.url) ?? asString(source.uri);
    const title = asString(source.title) ?? asString(source.filename);
    const id = asString(source.id) ?? asString(source.file_id);
    const startIndex = numberOr(source.start_index);
    const endIndex = numberOr(source.end_index);
    const citation = {
      ...id ? { id } : {},
      ...title ? { title } : {},
      ...uri ? { uri } : {},
      ...startIndex !== void 0 ? { startIndex } : {},
      ...endIndex !== void 0 ? { endIndex } : {}
    };
    return Object.keys(citation).length > 0 ? [citation] : [];
  });
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function responsesTool(tool) {
  if (tool.type === "web_search" || tool.type === "web_search_preview") {
    return { type: tool.type };
  }
  if (tool.type === "file_search") {
    return omitEmpty({ type: "file_search", vector_store_ids: tool.vectorStoreIds });
  }
  return omitEmpty({ type: "function", name: tool.name, description: tool.description, parameters: tool.parameters });
}
function safetyFrom(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  return Object.entries(value).flatMap(([category, detail]) => {
    if (!detail || typeof detail !== "object") {
      return [];
    }
    const record = detail;
    const severity = mapSeverity(asString(record.severity));
    return [{
      category,
      action: record.filtered === true ? "block" : "allow",
      ...severity ? { severity } : {}
    }];
  });
}
function mapSeverity(value) {
  if (value === "safe") {
    return "info";
  }
  if (value === "info" || value === "low" || value === "medium" || value === "high" || value === "critical") {
    return value;
  }
  return void 0;
}
function normalizeUsage(value) {
  if (!value || typeof value !== "object") {
    return void 0;
  }
  const usage = value;
  const inputDetails = usage.input_tokens_details && typeof usage.input_tokens_details === "object" ? usage.input_tokens_details : void 0;
  const outputDetails = usage.output_tokens_details && typeof usage.output_tokens_details === "object" ? usage.output_tokens_details : void 0;
  const mapped2 = omitEmpty({
    inputTokens: numberOr(usage.inputTokens, usage.input_tokens, usage.prompt_tokens),
    outputTokens: numberOr(usage.outputTokens, usage.output_tokens, usage.completion_tokens),
    totalTokens: numberOr(usage.totalTokens, usage.total_tokens),
    cachedInputTokens: numberOr(usage.cachedInputTokens, inputDetails?.cached_tokens),
    reasoningTokens: numberOr(usage.reasoningTokens, outputDetails?.reasoning_tokens)
  });
  return Object.keys(mapped2).length > 0 ? mapped2 : void 0;
}
function responseTextFormat(request) {
  if (request.responseFormat?.type !== "json") {
    return void 0;
  }
  if (request.responseFormat.schema) {
    return { format: { type: "json_schema", name: "result", schema: request.responseFormat.schema, strict: true } };
  }
  return { format: { type: "json_object" } };
}
function chatResponseFormat(request) {
  if (request.responseFormat?.type !== "json") {
    return void 0;
  }
  if (request.responseFormat.schema) {
    return { type: "json_schema", json_schema: { name: "result", schema: request.responseFormat.schema, strict: true } };
  }
  return { type: "json_object" };
}
function responsesToolChoice(choice) {
  if (!choice || typeof choice === "string") {
    return choice;
  }
  return { type: "function", name: choice.name };
}
function chatToolChoice(choice) {
  if (!choice || typeof choice === "string") {
    return choice;
  }
  return { type: "function", function: { name: choice.name } };
}
function safeOptions(options) {
  if (!options) {
    return {};
  }
  return Object.fromEntries(Object.entries(options).filter(([key]) => !SECRET_OPTION_KEYS.has(key.toLowerCase())));
}
function omitEmpty(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== void 0));
}
function parseJson2(value) {
  if (!value) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : void 0;
  } catch {
    return void 0;
  }
}
function asString(value) {
  return typeof value === "string" ? value : void 0;
}
function numberOr(...values) {
  return values.find((value) => typeof value === "number" && Number.isFinite(value));
}
function isContentFilter(message, providerCode) {
  if (providerCode === "content_filter") {
    return true;
  }
  return typeof message === "string" && /content management policy|content filter/i.test(message);
}
function statusError(status) {
  if (status === 401) {
    return { code: "AUTHENTICATION_ERROR", retryable: false };
  }
  if (status === 403) {
    return { code: "AUTHORIZATION_ERROR", retryable: false };
  }
  if (status === 408 || status === 504) {
    return { code: "TIMEOUT_ERROR", retryable: true };
  }
  if (status === 429) {
    return { code: "RATE_LIMIT_ERROR", retryable: true };
  }
  if (status === 503) {
    return { code: "PROVIDER_UNAVAILABLE", retryable: true };
  }
  if (status >= 400 && status < 500) {
    return { code: "PROVIDER_REQUEST_ERROR", retryable: false };
  }
  return { code: "PROVIDER_RESPONSE_ERROR", retryable: false };
}

// packages/ai-adapter-azure-openai/dist/redact.js
function redactText(value, secrets) {
  let output = value.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]");
  output = output.replace(/\bsk-[A-Za-z0-9]{8,}\b/g, "[REDACTED]");
  for (const secret of secrets) {
    if (secret) {
      output = output.split(secret).join("[REDACTED]");
    }
  }
  return output;
}
function redactValue(value, secrets) {
  if (typeof value === "string") {
    return redactText(value, secrets);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, secrets));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item, secrets)]));
  }
  return value;
}

// packages/ai-adapter-azure-openai/dist/resolve.js
function inspectAzureProfile(profile, env) {
  assertAzureProfile(profile);
  const checks = [];
  const endpoint = readSetting(profile.endpoint, profile.endpointEnv, env);
  const deployment = readSetting(profile.deployment, profile.deploymentEnv, env);
  const endpointCheck = validateEndpoint(endpoint);
  checks.push(endpointCheck.check);
  checks.push(deployment.value ? { name: "deployment", status: "pass", message: "deployment is configured" } : { name: "deployment", status: "fail", message: deployment.message });
  const credential = resolveCredential(profile, env);
  checks.push(credential.check);
  const executionApi = profile.executionApi ?? "responses";
  checks.push({ name: "api-surface", status: "pass", message: `v1/${executionApi}` });
  if (!endpointCheck.endpoint || !deployment.value || !credential.authorization) {
    return { checks };
  }
  return {
    checks,
    resolved: {
      endpoint: endpointCheck.endpoint,
      deployment: deployment.value,
      executionApi,
      timeoutMs: profile.timeoutMs ?? 3e4,
      secrets: credential.secrets,
      authorization: credential.authorization
    }
  };
}
function readSetting(literal, envName2, env) {
  if (literal && literal.trim()) {
    return { value: literal.trim(), message: "configured" };
  }
  if (!envName2) {
    return { message: "is not configured" };
  }
  const value = env[envName2];
  if (!value || !value.trim()) {
    return { message: `${envName2} is not set` };
  }
  return { value: value.trim(), message: "configured" };
}
function resourceEndpoint(url) {
  const path8 = url.pathname.replace(/\/$/, "");
  if (path8 === "" || path8 === "/openai" || path8 === "/openai/v1" || path8 === "/openai/deployments") {
    return url.origin;
  }
  return url.origin + path8;
}
function validateEndpoint(setting) {
  if (!setting.value) {
    return { check: { name: "endpoint", status: "fail", message: setting.message.startsWith("AZURE_") || setting.message.includes(" is not set") ? setting.message : "endpoint is not configured" } };
  }
  let url;
  try {
    url = new URL(setting.value);
  } catch {
    return { check: { name: "endpoint", status: "fail", message: "endpoint must be an https URL" } };
  }
  if (url.username || url.password || url.search) {
    return { check: { name: "endpoint", status: "fail", message: "endpoint must not include credentials" } };
  }
  if (url.protocol !== "https:") {
    return { check: { name: "endpoint", status: "fail", message: "endpoint must be an https URL" } };
  }
  return { check: { name: "endpoint", status: "pass", message: "https endpoint is configured" }, endpoint: resourceEndpoint(url) };
}
function resolveCredential(profile, env) {
  const envName2 = profile.credential.apiKeyEnv;
  const apiKey = env[envName2];
  if (!apiKey || !apiKey.trim()) {
    return { check: { name: "credential", status: "fail", message: `${envName2} is not set` }, secrets: [] };
  }
  return {
    check: { name: "credential", status: "pass", message: `using ${envName2}` },
    authorization: { type: "api-key", apiKey },
    secrets: [apiKey]
  };
}
function safeHealthMessage(message, secrets) {
  return redactText(message, secrets);
}

// packages/ai-adapter-azure-openai/dist/adapter.js
var CAPABILITIES = {
  text: true,
  images: false,
  streaming: false,
  structuredOutput: true,
  toolCalling: true,
  multiTurn: true,
  usage: true,
  contentSafetyMetadata: true,
  seed: true
};
var AzureOpenAIAdapter = class {
  id;
  name = "Azure OpenAI";
  version = AZURE_ADAPTER_VERSION;
  profile;
  #env;
  #fetch;
  #now;
  constructor(options) {
    assertAzureProfile(options.profile);
    this.id = options.id ?? AZURE_ADAPTER_ID;
    this.profile = options.profile;
    this.#env = options.env ?? process.env;
    this.#fetch = options.fetch ?? fetch;
    this.#now = options.now ?? Date.now;
  }
  async capabilities() {
    return CAPABILITIES;
  }
  async healthCheck(context) {
    const checkedAt = (/* @__PURE__ */ new Date()).toISOString();
    const inspected = inspectAzureProfile(this.profile, this.#env);
    const checks = [...inspected.checks ?? []];
    if (!inspected.resolved) {
      return { status: "unhealthy", checkedAt, checks };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), inspected.resolved.timeoutMs);
    const onAbort = () => controller.abort();
    context.signal?.addEventListener("abort", onAbort);
    try {
      const headers = await this.authorizationHeaders(inspected.resolved);
      const response = await this.#fetch(`${inspected.resolved.endpoint}/openai/v1/models`, {
        method: "GET",
        headers,
        signal: controller.signal
      });
      await response.body?.cancel();
      if (response.ok) {
        checks.push({ name: "reachability", status: "pass", message: "v1 models endpoint responded" });
        return { status: "healthy", checkedAt, checks: redactChecks(checks, inspected.resolved.secrets) };
      }
      const failure = response.status === 401 ? "authentication was rejected" : response.status === 403 ? "authorization was rejected" : `HTTP ${response.status}`;
      checks.push({ name: "reachability", status: "fail", message: failure });
      return { status: "unhealthy", checkedAt, checks: redactChecks(checks, inspected.resolved.secrets) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Health check failed";
      checks.push({ name: "reachability", status: "fail", message: safeHealthMessage(message, inspected.resolved.secrets) });
      return { status: "unhealthy", checkedAt, checks: redactChecks(checks, inspected.resolved.secrets) };
    } finally {
      clearTimeout(timer);
      context.signal?.removeEventListener("abort", onAbort);
    }
  }
  async execute(request, context) {
    if (requestHasImage(request)) {
      return this.failure(context, 0, [], "ADAPTER_CAPABILITY_ERROR", "Adapter does not support image content", false);
    }
    if (context.signal?.aborted) {
      return this.failure(context, 0, [], "TIMEOUT_ERROR", "Execution aborted", false);
    }
    const inspected = inspectAzureProfile(this.profile, this.#env);
    if (!inspected.resolved) {
      const message = inspected.checks.find((check) => check.status === "fail")?.message ?? "Azure configuration is incomplete";
      return this.failure(context, 0, [], "CONFIG_ERROR", message, false);
    }
    const resolved = inspected.resolved;
    const started = this.#now();
    const controller = new AbortController();
    let abortReason;
    const timer = setTimeout(() => {
      abortReason = abortReason ?? "timeout";
      controller.abort();
    }, attemptBudgetMs(context, resolved.timeoutMs));
    const onAbort = () => {
      abortReason = "caller";
      controller.abort();
    };
    context.signal?.addEventListener("abort", onAbort);
    try {
      const call = mapAzureCall(request, resolved);
      const headers = await this.authorizationHeaders(resolved);
      const response = await this.#fetch(`${resolved.endpoint}${call.path}`, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(call.body),
        signal: controller.signal
      });
      const raw = await response.text();
      const latencyMs = Math.max(0, this.#now() - started);
      const parsed = parseBody(raw);
      if (!response.ok) {
        const classified = statusError(response.status);
        const details = providerError(parsed ?? raw);
        if (isContentFilter(details.message, details.providerCode)) {
          return this.blocked(context, latencyMs, details.message || "Azure content filter blocked the prompt", resolved.secrets, redactValue({ status: response.status, body: parsed ?? raw }, resolved.secrets));
        }
        const retryAfterMs = classified.code === "RATE_LIMIT_ERROR" ? retryAfter(response.headers.get("retry-after")) : void 0;
        return this.failure(context, latencyMs, resolved.secrets, classified.code, details.message || `HTTP ${response.status}`, classified.retryable, details.providerCode ?? String(response.status), retryAfterMs, redactValue({ status: response.status, body: parsed ?? raw }, resolved.secrets));
      }
      const mapped2 = mapAzureOutput(parsed);
      const native = redactValue({ status: response.status, body: parsed ?? raw }, resolved.secrets);
      return {
        id: mapped2.id ?? `${this.id}-completed`,
        adapterId: this.id,
        status: mapped2.status,
        output: {
          ...mapped2.text !== void 0 ? { text: mapped2.text } : {},
          ...mapped2.structured !== void 0 ? { structured: mapped2.structured } : {}
        },
        ...mapped2.toolCalls ? { toolCalls: mapped2.toolCalls } : {},
        ...mapped2.citations ? { citations: mapped2.citations } : {},
        ...mapped2.usage ? { usage: mapped2.usage } : {},
        ...mapped2.safety ? { safety: mapped2.safety } : {},
        ...mapped2.finishReason ? { finishReason: mapped2.finishReason } : {},
        timing: timing(context.startedAt, latencyMs),
        model: {
          requested: call.requested,
          deployment: call.deployment,
          ...mapped2.providerModel ? { providerModel: mapped2.providerModel } : {}
        },
        native
      };
    } catch (error) {
      const latencyMs = Math.max(0, this.#now() - started);
      if (abortReason === "caller" || context.signal?.aborted) {
        return this.failure(context, latencyMs, resolved.secrets, "TIMEOUT_ERROR", "Execution aborted", false);
      }
      if (abortReason === "timeout" || isAbortError(error)) {
        return this.failure(context, latencyMs, resolved.secrets, "TIMEOUT_ERROR", "Azure request timed out", true);
      }
      const message = error instanceof Error ? error.message : "Azure request failed";
      return this.failure(context, latencyMs, resolved.secrets, "NETWORK_ERROR", message, true);
    } finally {
      clearTimeout(timer);
      context.signal?.removeEventListener("abort", onAbort);
    }
  }
  async collectEvidence(result, context) {
    const secrets = inspectAzureProfile(this.profile, this.#env).resolved?.secrets ?? [];
    return {
      adapterId: this.id,
      capturedAt: result.timing.completedAt,
      redacted: true,
      payload: redactValue({ caseId: context.caseId, native: result.native, error: result.error }, secrets)
    };
  }
  blocked(context, latencyMs, message, secrets, native) {
    const text = redactText(message, secrets);
    return {
      id: `${this.id}-blocked`,
      adapterId: this.id,
      status: "blocked",
      output: { text },
      safety: [{ category: "content-filter", action: "block", severity: "high" }],
      finishReason: "content_filter",
      timing: timing(context.startedAt, latencyMs),
      ...native !== void 0 ? { native } : {}
    };
  }
  failure(context, latencyMs, secrets, code, message, retryable, providerCode, retryAfterMs, native) {
    return {
      id: `${this.id}-failed`,
      adapterId: this.id,
      status: "failed",
      output: {},
      timing: timing(context.startedAt, latencyMs),
      ...native !== void 0 ? { native } : {},
      error: {
        code,
        message: redactText(message, secrets),
        retryable,
        ...providerCode ? { providerCode } : {},
        ...retryAfterMs !== void 0 ? { retryAfterMs } : {}
      }
    };
  }
  async authorizationHeaders(resolved) {
    return { "api-key": resolved.authorization.apiKey };
  }
};
function timing(startedAt, latencyMs) {
  return {
    startedAt,
    completedAt: new Date(Date.parse(startedAt) + latencyMs).toISOString(),
    latencyMs
  };
}
function attemptBudgetMs(context, fallbackMs) {
  const deadline = Date.parse(context.deadline ?? "");
  const started = Date.parse(context.startedAt);
  if (!Number.isFinite(deadline) || !Number.isFinite(started)) {
    return fallbackMs;
  }
  return Math.max(1, deadline - started);
}
function parseBody(raw) {
  if (!raw) {
    return void 0;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
function retryAfter(header) {
  if (!header) {
    return void 0;
  }
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return void 0;
  }
  return Math.round(seconds * 1e3);
}
function isAbortError(error) {
  return error instanceof Error && error.name === "AbortError";
}
function redactChecks(checks, secrets) {
  return checks.map((check) => ({
    ...check,
    ...check.message ? { message: redactText(check.message, secrets) } : {}
  }));
}

// packages/ai-adapter-azure-openai/dist/doctor.js
async function runAzureDoctor(options) {
  const write = options.write ?? ((line) => console.log(line));
  if (options.platform !== AZURE_ADAPTER_ID) {
    write(`Unknown AI platform "${options.platform}". Supported platform: ${AZURE_ADAPTER_ID}`);
    return 2;
  }
  try {
    const adapter = new AzureOpenAIAdapter({
      profile: options.profile ?? defaultAzureProfile,
      env: options.env,
      fetch: options.fetch
    });
    const health = await adapter.healthCheck({});
    write(`${AZURE_ADAPTER_ID}: ${health.status}`);
    for (const check of health.checks ?? []) {
      write(formatCheck(check));
    }
    return doctorExitCode(health);
  } catch (error) {
    write(error instanceof AIEvaluationError ? error.message : "Azure configuration is invalid");
    return 2;
  }
}
function formatCheck(check) {
  return check.message ? `${check.name}: ${check.status} \u2014 ${check.message}` : `${check.name}: ${check.status}`;
}
function doctorExitCode(health) {
  if (health.status === "healthy") {
    return 0;
  }
  const configFailed = (health.checks ?? []).some((check) => check.status === "fail" && check.name !== "reachability");
  return configFailed ? 2 : 3;
}
function azureConfigurationIssues(env = process.env, profile = defaultAzureProfile) {
  try {
    const inspected = inspectAzureProfile(profile, env);
    return inspected.checks.filter((check) => check.status === "fail").map((check) => check.message ? `${check.name}: ${check.message}` : check.name);
  } catch (error) {
    return [error instanceof Error ? error.message : "Azure configuration is invalid"];
  }
}

// packages/ai-artefacts/dist/import-test-genie.js
var import_node_fs2 = require("node:fs");
var import_promises2 = require("node:fs/promises");
var import_node_path3 = __toESM(require("node:path"), 1);

// packages/ai-artefacts/dist/test-genie.js
var TEST_GENIE_CONTRACT_VERSION = "1.0.0";
var AMBIGUOUS = /^(should work|tbd|todo|n\/a)?$/i;
var TestGenieArtifactProvider = class {
  id = "test-genie";
  contractVersion = TEST_GENIE_CONTRACT_VERSION;
  load(payload) {
    const bundle = payload;
    if (bundle.contractVersion !== this.contractVersion) {
      throw new Error(`Unsupported Test Genie contract version "${String(bundle.contractVersion)}"`);
    }
    if (!bundle.generationId || !bundle.generatedAt) {
      throw new Error("Test Genie generation id and timestamp are required");
    }
    if (bundle.sourceDocument?.hash && !/^[a-f0-9]{64}$/i.test(bundle.sourceDocument.hash)) {
      throw new Error("Source document hash must be SHA-256");
    }
    return {
      contractVersion: bundle.contractVersion,
      generationId: bundle.generationId,
      generatedAt: bundle.generatedAt,
      sourceSystem: bundle.sourceSystem,
      title: bundle.title,
      features: bundle.features,
      sourceDocument: bundle.sourceDocument,
      requirements: bundle.requirements ?? [],
      acceptanceTests: bundle.acceptanceTests ?? [],
      testCases: bundle.testCases ?? []
    };
  }
};
function verifyTestGenieBundle(bundle, requiredCoverage = false) {
  const findings = [];
  const requirementIds = new Set(bundle.requirements.map((item) => item.id));
  const acceptanceIds = new Set(bundle.acceptanceTests.map((item) => item.id));
  const seenCases = /* @__PURE__ */ new Set();
  for (const acceptance of bundle.acceptanceTests) {
    if (!requirementIds.has(acceptance.requirementId)) {
      findings.push(`Acceptance test ${acceptance.id} has no requirement`);
    }
  }
  for (const testCase of bundle.testCases) {
    if (seenCases.has(testCase.id)) {
      findings.push(`Duplicate test case ${testCase.id}`);
    }
    seenCases.add(testCase.id);
    if (!acceptanceIds.has(testCase.acceptanceTestId)) {
      findings.push(`Test case ${testCase.id} has no acceptance test`);
    }
    if (testCase.preconditions.length === 0) {
      findings.push(`Test case ${testCase.id} has no preconditions`);
    }
    if (testCase.steps.length === 0 || testCase.steps.some((step) => step.action.trim().length === 0 || step.expected.trim().length === 0)) {
      findings.push(`Test case ${testCase.id} needs steps and expected results`);
    }
    if (testCase.steps.some((step) => AMBIGUOUS.test(step.expected.trim()))) {
      findings.push(`Test case ${testCase.id} has ambiguous expected behaviour`);
    }
    if (requiredCoverage) {
      for (const kind of ["positive", "negative", "boundary"]) {
        if (!testCase.coverage.includes(kind)) {
          findings.push(`Test case ${testCase.id} is missing ${kind} coverage`);
        }
      }
    }
  }
  const titles = bundle.testCases.map((item) => item.title.trim().toLowerCase());
  if (new Set(titles).size !== titles.length) {
    findings.push("Conflicting test cases share a title");
  }
  if (findings.some((item) => item.includes("no requirement") || item.includes("no acceptance") || item.includes("Duplicate"))) {
    return { outcome: "REJECTED", findings };
  }
  if (findings.length > 0) {
    return { outcome: "REVIEW_REQUIRED", findings };
  }
  return { outcome: "VERIFIED", findings: [] };
}
function assertReadyForCodeGeneration(verification) {
  if (verification.outcome !== "VERIFIED") {
    throw new Error(`Unverified artefacts cannot enter code generation (${verification.outcome})`);
  }
}

// packages/ai-artefacts/dist/uiSteps.js
var OPEN_WEBSITE_STEP = "a visitor opens the website";
function isNavigate(text) {
  return /\b(opens?|visits?|goes to|navigates? to|loads?)\b/i.test(text) || /https?:\/\//i.test(text);
}
function isDisplayed(text) {
  return /\b(?:is|are)\s+(?:displayed|shown|visible)\b/i.test(text);
}
function urlFromText(text) {
  return String(text || "").match(/https?:\/\/[^\s"'<>]+/i)?.[0] || "";
}
function hideProductUrl(text) {
  return stripProductUrls(String(text || ""));
}
function stripProductUrls(text) {
  return String(text || "").replace(/\b(?:a visitor |the user |I )?(?:opens?|visits?|goes to|navigates? to|loads?)\s+https?:\/\/[^\s"'<>]+/gi, OPEN_WEBSITE_STEP).replace(/https?:\/\/[^\s"'<>]+/gi, "the website").replace(/([^ \n]) {2,}/g, "$1 ").replace(/[ \t]+\n/g, "\n");
}
function visibleTargets(text) {
  const targets = [];
  const seen = /* @__PURE__ */ new Set();
  const parts = String(text || "").split(/\s+(?:is|are)\s+(?:displayed|shown|visible)\b/i);
  for (let index = 0; index < parts.length - 1; index += 1) {
    const chunk = String(parts[index] || "").replace(/\s+/g, " ").trim();
    const match = chunk.match(/.*\bthe\s+((?:[A-Za-z][\w&'-]*)(?:\s+[A-Za-z][\w&'-]*){0,2})\s*$/i);
    const noun = match ? match[1].trim() : "";
    const key = noun.toLowerCase();
    if (!noun || key === "page" || key === "it" || /finishes loading|page is ready/.test(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    targets.push({
      name: toName(noun) || "element",
      type: /\b(heading|title|logo|card|image|link)\b/i.test(noun) ? "link" : "button",
      find: { by: "text", value: noun, fromDom: false }
    });
  }
  return targets;
}
function urlFromCase(testCase, step) {
  return testCase.page?.url || urlFromText(step?.action || "") || urlFromText(testCase.steps.map((item) => item.action).join(" "));
}
function expandUiSteps(testCase) {
  const blob = testCase.steps.filter((step) => !step.target && !step.api).map((step) => `${step.action} ${step.expected}`).join(" ");
  const visibles = visibleTargets(blob);
  const url = urlFromCase(testCase);
  const steps = [];
  if (url && !testCase.steps.some((step) => isNavigate(step.action))) {
    steps.push({ action: OPEN_WEBSITE_STEP, expected: "the page is ready" });
  }
  for (const step of testCase.steps) {
    if (step.api || step.target) {
      steps.push(step);
      continue;
    }
    if (isNavigate(step.action) && url) {
      if (!steps.some((item) => isNavigate(item.action))) {
        steps.push({
          action: OPEN_WEBSITE_STEP,
          expected: step.expected && !isDisplayed(step.expected) ? step.expected : "the page is ready"
        });
      }
      continue;
    }
    if (visibleTargets(`${step.action} ${step.expected}`).length > 0)
      continue;
    steps.push(step);
  }
  for (const target of visibles) {
    if (steps.some((step) => {
      const name = String(step.target?.name || "").toLowerCase();
      const value = String(step.target?.find.value || "").toLowerCase();
      const action = String(step.action || "").toLowerCase();
      return name === target.name.toLowerCase() || value === target.find.value.toLowerCase() || action.includes(target.find.value.toLowerCase());
    })) {
      continue;
    }
    steps.push({
      action: `the ${target.find.value} is displayed`,
      expected: `the ${target.find.value} is displayed`,
      target
    });
  }
  return {
    ...testCase,
    steps: steps.length > 0 ? steps : testCase.steps,
    page: testCase.page || (url ? { name: "app", url } : void 0)
  };
}
function methodName(step, fallback) {
  if (step.target?.name)
    return step.target.name;
  if (step.api)
    return "callApi";
  if (isNavigate(step.action))
    return "openPage";
  return fallback;
}
function toName(label) {
  const words = String(label || "").replace(/[^A-Za-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (words.length === 0)
    return "";
  return words[0].toLowerCase() + words.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
}

// packages/ai-artefacts/dist/klassiHelpers.js
function helperForStep(step, testCase, selector) {
  if (step.api) {
    const route = apiPathOnly(step.api.path);
    const urlExpr = `(process.env.PRODUCT_API_URL || '') + '${escapeQuote(route)}'`;
    const expected = Number.isFinite(step.api.expectedStatus) ? step.api.expectedStatus : 200;
    return {
      name: "apiCall",
      expression: `await helpers.apiCall(${urlExpr}, '${escapeQuote(step.api.method || "GET")}', null, null, null, ${expected})`
    };
  }
  const pageUrl = urlFromCase(testCase, step);
  if (pageUrl && isNavigate(step.action) && !selector) {
    return { name: "loadPage", expression: "await helpers.loadPage(env.base_url)" };
  }
  if (!selector) {
    return null;
  }
  if (isDisplayed(step.action)) {
    return null;
  }
  if (step.target?.type === "input" || step.target?.type === "select") {
    return { name: "waitAndSetValue", expression: `await helpers.waitAndSetValue('${escapeQuote(selector)}', '')` };
  }
  return { name: "waitAndClick", expression: `await helpers.waitAndClick('${escapeQuote(selector)}')` };
}
function apiPathOnly(path8) {
  const raw = String(path8 || "").trim();
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      return `${parsed.pathname}${parsed.search}` || "/";
    } catch {
      return "/";
    }
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}
function escapeQuote(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// packages/ai-artefacts/dist/bdd.js
var STEP_KEYWORDS = ["Given", "When", "Then", "And", "But"];
function featureFromCases(title, cases, verification, options = {}) {
  assertReadyForCodeGeneration(verification);
  const expanded = cases.map(({ testCase, trace }) => ({ testCase: expandUiSteps(testCase), trace }));
  const productUrl = productUrlFromCases(expanded.map((item) => item.testCase), options.productUrl);
  const scenarios = expanded.map(({ testCase, trace }) => scenarioBlock(testCase, trace, Boolean(productUrl)));
  const lines = [`Feature: ${hideProductUrl(title)}`, ""];
  if (productUrl) {
    lines.push("  Background:", `    Given ${OPEN_WEBSITE_STEP}`, "");
  }
  lines.push(scenarios.join("\n\n"), "");
  return lines.join("\n");
}
function pageObjectFromFeature(feature, cases = []) {
  const fromCases = pageMethodsFromCases(cases.length > 0 ? cases.map(expandUiSteps) : casesFromFeature(feature));
  if (fromCases.length === 0) {
    return "module.exports = {};\n";
  }
  return `module.exports = {
${fromCases.join(",\n")}
};
`;
}
function stepsFromCases(feature, pageObjectPath, cases = []) {
  const resolved = cases.length > 0 ? cases.map(expandUiSteps) : casesFromFeature(feature);
  const methods = methodIndex(resolved);
  const lines = [];
  const seen = /* @__PURE__ */ new Set();
  let usesPage = false;
  for (const step of featureSteps(feature)) {
    const keyword = step.keyword === "And" || step.keyword === "But" ? "Then" : step.keyword;
    const key = `${keyword}:${step.text}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    const matched = caseStepForText(resolved, step.text);
    const helper = matched ? helperForStep(matched.step, matched.testCase, selectorFromTarget(matched.step.target)) : null;
    const method = methods.get(step.text);
    let body = "  return undefined;";
    if (helper) {
      body = `  ${helper.expression};`;
    } else if (method) {
      usesPage = true;
      body = `  await page.${method}();`;
    }
    lines.push(`${keyword}('${escapeQuote2(step.text)}', async function () {`, body, "});", "");
  }
  const header = usesPage ? `const page = require('${pageObjectPath}');

` : "";
  return `${header}${lines.join("\n")}`;
}
function selectorFromTarget(target) {
  const by = target?.find?.by;
  const value = String(target?.find?.value || "").trim();
  if (!by || !value || target?.find.fromDom === false)
    return null;
  if (by === "id")
    return `#${value.replace(/[^A-Za-z0-9_-]/g, "")}`;
  if (by === "name")
    return `[name="${escapeAttr(value)}"]`;
  if (by === "class")
    return `.${value.replace(/[^\w-]/g, "")}`;
  if (by === "tag")
    return value.replace(/[^a-z0-9]/gi, "");
  if (by === "link" || by === "text")
    return `=${value}`;
  if (by === "partialLink")
    return `*=${value}`;
  if (by === "css")
    return value;
  if (by === "xpath")
    return value;
  if (by === "testid")
    return `[data-testid="${escapeAttr(value)}"]`;
  return `aria/${value}`;
}
function unboundSteps(cases) {
  return cases.flatMap((testCase) => expandUiSteps(testCase).steps.flatMap((step) => {
    if (step.api)
      return [];
    if (selectorFromTarget(step.target))
      return [];
    if (urlFromCase(testCase, step) && isNavigate(step.action))
      return [];
    return step.action ? [`Unbound step: ${step.action}`] : [];
  }));
}
function pageMethodsFromCases(cases) {
  const methods = [];
  const seen = /* @__PURE__ */ new Set();
  for (const testCase of cases) {
    expandUiSteps(testCase).steps.forEach((step) => {
      const selector = selectorFromTarget(step.target);
      if (helperForStep(step, testCase, selector)) {
        return;
      }
      const name = methodName(step, `step${methods.length + 1}`);
      if (seen.has(name))
        return;
      seen.add(name);
      if (!selector) {
        methods.push(`  // unbound: ${hideProductUrl(step.action || testCase.title)}
  async ${name}() {
    await global.browser.pause(0);
  }`);
        return;
      }
      methods.push(`  // ${hideProductUrl(step.action)}
  async ${name}() {
    await global.browser.$('${escapeQuote2(selector)}').waitForDisplayed();
  }`);
    });
  }
  return methods;
}
function methodIndex(cases) {
  const methods = /* @__PURE__ */ new Map();
  for (const testCase of cases) {
    for (const step of expandUiSteps(testCase).steps) {
      if (helperForStep(step, testCase, selectorFromTarget(step.target)))
        continue;
      const name = methodName(step, "");
      if (!name || !step.action)
        continue;
      methods.set(step.action, name);
    }
  }
  return methods;
}
function caseStepForText(cases, text) {
  for (const testCase of cases) {
    for (const step of expandUiSteps(testCase).steps) {
      if (step.action === text) {
        return { testCase, step };
      }
    }
  }
  for (const testCase of cases) {
    for (const step of expandUiSteps(testCase).steps) {
      if (step.expected === text && !isNavigate(step.action)) {
        return { testCase, step };
      }
    }
  }
  return null;
}
function casesFromFeature(feature) {
  const uses = featureSteps(feature);
  if (uses.length === 0)
    return [];
  const action = uses.filter((item) => item.keyword === "Given" || item.keyword === "When").map((item) => item.text).join(" ");
  const expected = uses.filter((item) => item.keyword === "Then" || item.keyword === "And").map((item) => item.text).join(" ");
  return [expandUiSteps({
    id: "TC-feature",
    acceptanceTestId: "AT-feature",
    title: "Imported feature",
    preconditions: ["The system is available"],
    coverage: ["positive", "negative", "boundary"],
    steps: [{ action: action || expected, expected: expected || "the page is ready" }]
  })];
}
function escapeAttr(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function productUrlFromCases(cases, fallback = "") {
  for (const testCase of cases) {
    const url = urlFromCase(testCase);
    if (url)
      return url;
  }
  return String(fallback || "").replace(/\/+$/, "");
}
function scenarioBlock(testCase, trace, hoistOpenPage = false) {
  const tags = [
    `@${trace.requirementId.startsWith("BR-") ? trace.requirementId : `BR-${trace.requirementId}`}`,
    `@${trace.acceptanceTestId.startsWith("AT-") ? trace.acceptanceTestId : `AT-${trace.acceptanceTestId}`}`,
    `@${testCase.id.startsWith("TC-") ? testCase.id : `TC-${testCase.id}`}`
  ];
  const remaining = hoistOpenPage ? testCase.steps.filter((step) => !isNavigate(step.action) || step.target || step.api) : testCase.steps;
  const steps = (remaining.length > 0 ? remaining : testCase.steps.slice(-1)).flatMap((step, index) => {
    const action = hideProductUrl(step.action);
    const expected = hideProductUrl(step.expected);
    const assertionOnly = action === expected || isDisplayed(action) && !isNavigate(action) && !step.api;
    if (assertionOnly)
      return [`${index === 0 ? "Then" : "And"} ${expected}`];
    if (hoistOpenPage && isNavigate(action) && !step.target && !step.api) {
      return [`Then ${expected}`];
    }
    if (isNavigate(action) && !step.target && !step.api) {
      return [`${index === 0 ? "When" : "And"} ${OPEN_WEBSITE_STEP}`, `Then ${expected}`];
    }
    if (step.target && !isDisplayed(action) && / page opens$/i.test(expected)) {
      return [`${index === 0 ? "When" : "And"} ${action}`];
    }
    return [`${index === 0 ? "When" : "And"} ${action}`, `Then ${expected}`];
  }).join("\n    ");
  const examples = exampleTable(testCase.examples);
  const keyword = examples ? "Scenario Outline" : "Scenario";
  return [`  ${tags.join(" ")}`, `  ${keyword}: ${hideProductUrl(testCase.title)}`, `    ${steps}`, examples].filter(Boolean).join("\n");
}
function exampleTable(examples) {
  if (!examples || examples.headers.length === 0 || examples.rows.length === 0)
    return "";
  const header = `      | ${examples.headers.map((name) => hideProductUrl(name)).join(" | ")} |`;
  const rows = examples.rows.map((row) => `      | ${examples.headers.map((name) => hideProductUrl(row[name] ?? "")).join(" | ")} |`);
  return ["    Examples:", header, ...rows].join("\n");
}
function featureSteps(feature) {
  return feature.split("\n").map((line) => line.trim()).flatMap((line) => {
    const keyword = STEP_KEYWORDS.find((item) => line.startsWith(`${item} `));
    return keyword ? [{ keyword, text: line.slice(keyword.length).trim() }] : [];
  });
}
function escapeQuote2(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// packages/ai-artefacts/dist/import-test-genie.js
init_locatorBind();
init_outlineExamples();

// packages/ai-artefacts/dist/realizeFromDom.js
init_locatorBind();
init_outlineExamples();
function isNavCase(testCase) {
  const blob = caseBlob(testCase);
  if (isNegativeDomGuess(blob))
    return false;
  return /navigation link|nav link|\bmenu\b|main heading/i.test(blob) || Boolean(testCase.examples?.headers.some((header) => /nav|link|page_name|main_heading/i.test(header)));
}
function isUnverifiableFromDom(testCase) {
  return isNegativeDomGuess(caseBlob(testCase));
}
function realizeCasesFromDom(cases, nodes, rows) {
  let wroteNav = false;
  return cases.flatMap((testCase) => {
    if (isUnverifiableFromDom(testCase))
      return [];
    if (isNavCase(testCase) && rows.length > 0) {
      if (wroteNav)
        return [];
      wroteNav = true;
      return rows.map((row, index) => navCaseFromRow(testCase, row, nodes, index));
    }
    return [testCase];
  });
}
function isSyntheticSuite(feature, steps = "", pageObject = "") {
  const blob = `${feature}
${steps}
${pageObject}`;
  return /\|\s*example\d+\s*\|/i.test(blob) || /unbound:/i.test(blob) || /pause\(0\)/.test(blob) || /a visitor is on any public page/i.test(blob) || /selects the "<navigation_link>"/i.test(blob);
}
function navCaseFromRow(testCase, row, nodes, index) {
  const link = navLinksFromNodes(nodes).find((node) => normalize3(node.text) === normalize3(row.navigation_link));
  const destNodes = nodes.filter((node) => node.pageUrl && normalizeHref(node.pageUrl) === normalizeHref(row.href));
  const headingNode = destNodes.find((node) => node.text && normalize3(node.text) === normalize3(row.main_heading) && /^h[1-6]$/.test(node.tag || "")) || destNodes.find((node) => node.tag === "h1" || node.tag === "h2");
  const clickFind = link && findFromNode(link) || { by: "text", value: row.navigation_link };
  const headingFind = headingNode && findFromNode(headingNode) || {
    by: "css",
    value: `h1*=${stripMarks(row.main_heading)},h2*=${stripMarks(row.main_heading)}`
  };
  return {
    ...testCase,
    id: index === 0 ? testCase.id : `${testCase.id}-${String(index + 1).padStart(2, "0")}`,
    title: `Visitor opens ${row.page_name} from the menu`,
    examples: void 0,
    steps: [
      {
        action: `the visitor selects the ${row.navigation_link} navigation link`,
        expected: `the ${row.page_name} page opens`,
        target: {
          name: toName(row.navigation_link) || "navLink",
          type: "link",
          find: { ...clickFind, fromDom: true }
        }
      },
      {
        action: `the ${row.main_heading} heading is displayed`,
        expected: `the ${row.main_heading} heading is displayed`,
        target: {
          name: toName(`${row.main_heading} heading`) || "mainHeading",
          type: "link",
          find: { ...headingFind, fromDom: true }
        }
      }
    ]
  };
}
function caseBlob(testCase) {
  return [testCase.title, ...testCase.steps.map((step) => `${step.action} ${step.expected}`)].join(" ");
}
function isNegativeDomGuess(blob) {
  return /\b(fail|fails|failed|error|unavailable|not available|network issues?|blank page|application error)\b/i.test(blob);
}
function stripMarks(value) {
  return String(value || "").replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();
}
function normalize3(value) {
  return String(value || "").trim().toLowerCase();
}

// packages/ai-artefacts/dist/import-test-genie.js
var provider = new TestGenieArtifactProvider();
async function readBundle(fileOrDir) {
  const info = await (0, import_promises2.stat)(fileOrDir);
  const file = info.isDirectory() ? import_node_path3.default.join(fileOrDir, "bundle.json") : fileOrDir;
  return JSON.parse(await (0, import_promises2.readFile)(file, "utf8"));
}
async function fetchBundle(generationId, env = process.env) {
  const base = env.TEST_GENIE_URL;
  const token = env.TEST_GENIE_TOKEN;
  if (!base || !token) {
    throw new Error("TEST_GENIE_URL and TEST_GENIE_TOKEN are required");
  }
  const url = new URL(`/v1/generations/${encodeURIComponent(generationId)}`, base.endsWith("/") ? base : `${base}/`);
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) {
    throw new Error(`Test Genie returned HTTP ${response.status}`);
  }
  return response.json();
}
async function importTestGenieBundle(payload, outDir, options = {}) {
  const bundle = provider.load(payload);
  const env = options.env ?? process.env;
  const shouldBind = options.bindLocators === true;
  let boundCases = bundle.testCases.map(expandUiSteps);
  const productUrl = boundCases.map((testCase) => urlFromCase(testCase)).find(Boolean) || String(env.PRODUCT_BASE_URL || "").replace(/\/+$/, "");
  if (productUrl) {
    boundCases = boundCases.map((testCase) => testCase.page || testCase.steps.every((step) => step.api) ? testCase : expandUiSteps({ ...testCase, page: { name: "app", url: productUrl } }));
  }
  const bindFindings = [];
  if (shouldBind) {
    const bound = await bindBundleToProduct(boundCases, env, options);
    boundCases = bound.cases;
    bindFindings.push(...bound.findings);
  }
  const verification = verifyTestGenieBundle({ ...bundle, testCases: boundCases }, true);
  const written = verification.outcome === "VERIFIED" ? await writeBundle({ ...bundle, testCases: boundCases }, verification, outDir, env.PRODUCT_BASE_URL || "") : { imported: [], skipped: [], unbound: [] };
  const findings = [...verification.findings, ...bindFindings, ...written.unbound];
  await (0, import_promises2.mkdir)(import_node_path3.default.join(outDir, ".klassi", "test-genie"), { recursive: true });
  await (0, import_promises2.writeFile)(import_node_path3.default.join(outDir, ".klassi", "test-genie", `${safeName(bundle.generationId)}.json`), JSON.stringify({ generationId: bundle.generationId, sourceSystem: bundle.sourceSystem, outcome: verification.outcome, findings, imported: written.imported, skipped: written.skipped }, null, 2));
  return { generationId: bundle.generationId, sourceSystem: bundle.sourceSystem, outcome: verification.outcome, findings, imported: written.imported, skipped: written.skipped };
}
async function writeBundle(bundle, verification, outDir, fallbackUrl = "") {
  const cases = bundle.testCases.flatMap((testCase) => {
    const acceptance = bundle.acceptanceTests.find((item) => item.id === testCase.acceptanceTestId);
    return acceptance ? [{ testCase, acceptance }] : [];
  });
  const productUrl = cases.map(({ testCase }) => urlFromCase(expandUiSteps(testCase))).find(Boolean) || String(fallbackUrl || "").replace(/\/+$/, "");
  const imported = [];
  const skipped = [];
  const unbound = [];
  for (const group of featureGroups(bundle, cases)) {
    const uiUrl = group.cases.every(({ testCase }) => testCase.steps.length > 0 && testCase.steps.every((step) => step.api)) ? "" : productUrl;
    const featureText = featureFromCases(group.title, group.cases.map(({ testCase, acceptance }) => ({
      testCase,
      trace: { requirementId: acceptance.requirementId, acceptanceTestId: acceptance.id }
    })), verification, { productUrl: uiUrl });
    const name = safeName(group.id);
    const feature = import_node_path3.default.join(outDir, "features", `${name}.feature`);
    const steps = import_node_path3.default.join(outDir, "step_definitions", `${name}-steps.js`);
    const pageObject = import_node_path3.default.join(outDir, "page-objects", `${name}.js`);
    if ((0, import_node_fs2.existsSync)(feature) || (0, import_node_fs2.existsSync)(steps) || (0, import_node_fs2.existsSync)(pageObject)) {
      const existing = [
        (0, import_node_fs2.existsSync)(feature) ? await (0, import_promises2.readFile)(feature, "utf8") : "",
        (0, import_node_fs2.existsSync)(steps) ? await (0, import_promises2.readFile)(steps, "utf8") : "",
        (0, import_node_fs2.existsSync)(pageObject) ? await (0, import_promises2.readFile)(pageObject, "utf8") : ""
      ];
      if (!isSyntheticSuite(existing[0], existing[1], existing[2])) {
        await refreshExistingFeature(feature, featureText);
        await stripUrlsInFile(steps);
        await stripUrlsInFile(pageObject);
        skipped.push(group.id);
        continue;
      }
    }
    await (0, import_promises2.mkdir)(import_node_path3.default.dirname(feature), { recursive: true });
    await (0, import_promises2.mkdir)(import_node_path3.default.dirname(steps), { recursive: true });
    await (0, import_promises2.mkdir)(import_node_path3.default.dirname(pageObject), { recursive: true });
    const caseList = group.cases.map(({ testCase }) => testCase);
    await (0, import_promises2.writeFile)(feature, stripProductUrls(featureText));
    await (0, import_promises2.writeFile)(steps, stripProductUrls(stepsFromCases(featureText, `../page-objects/${name}`, caseList)));
    await (0, import_promises2.writeFile)(pageObject, stripProductUrls(pageObjectFromFeature(featureText, caseList)));
    unbound.push(...unboundSteps(caseList));
    for (const { testCase, acceptance } of group.cases) {
      imported.push({
        id: testCase.id,
        requirementId: acceptance.requirementId,
        acceptanceTestId: acceptance.id,
        feature,
        steps,
        pageObject
      });
    }
  }
  return { imported, skipped, unbound };
}
function featureGroups(bundle, cases) {
  const titles = new Map((bundle.features ?? []).map((feature) => [feature.id, feature.title]));
  const groups = /* @__PURE__ */ new Map();
  const ungrouped = [];
  for (const item of cases) {
    const id = item.testCase.featureId;
    if (!id) {
      ungrouped.push(item);
      continue;
    }
    const group = groups.get(id) ?? { id, title: titles.get(id) || id, cases: [] };
    group.cases.push(item);
    groups.set(id, group);
  }
  if (ungrouped.length > 0) {
    const title = bundle.title?.trim() || (ungrouped.length === 1 ? ungrouped[0].testCase.title : "Imported tests");
    groups.set(title, { id: title, title, cases: ungrouped });
  }
  return [...groups.values()];
}
function safeName(value) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_");
}
async function refreshExistingFeature(file, featureText) {
  if (!(0, import_node_fs2.existsSync)(file))
    return;
  const current = await (0, import_promises2.readFile)(file, "utf8");
  const next = stripProductUrls(mergeDomExamples(current, featureText));
  if (next !== current) {
    await (0, import_promises2.writeFile)(file, next);
  }
}
async function stripUrlsInFile(file) {
  if (!(0, import_node_fs2.existsSync)(file))
    return;
  const current = await (0, import_promises2.readFile)(file, "utf8");
  const next = stripProductUrls(current);
  if (next !== current) {
    await (0, import_promises2.writeFile)(file, next);
  }
}
async function bindBundleToProduct(cases, env, options) {
  const urls = [...new Set(cases.map((item) => resolveProductUrl(item.page?.url, env)).filter((item) => Boolean(item)))];
  if (urls.length === 0) {
    return { cases, findings: ["Product URL is missing; locators were not harvested"] };
  }
  const findings = [];
  try {
    const nodes = await harvestPages(urls, env, options, true);
    const allNodes = await withNavPages(nodes, urls, env, options);
    const rows = navRowsFromNodes(allNodes, urls[0] || "");
    const bound = realizeCasesFromDom(bindCasesToNodes(cases, allNodes), allNodes, rows);
    findings.push(`Harvested ${allNodes.length} DOM node${allNodes.length === 1 ? "" : "s"} from ${urls.length} page${urls.length === 1 ? "" : "s"}`);
    if (rows.length > 0) {
      findings.push(`Wrote ${rows.length} menu test${rows.length === 1 ? "" : "s"} from the live DOM`);
    }
    return { cases: bound, findings };
  } catch (error) {
    findings.push(error instanceof Error ? error.message : String(error));
    return { cases, findings };
  }
}
async function harvestPages(urls, env, options, followNav = false) {
  if (options.harvestDom) {
    const nodes = [];
    for (const url of urls) {
      nodes.push(...(await options.harvestDom([url], env)).map((node) => ({ ...node, pageUrl: node.pageUrl || url })));
    }
    return nodes;
  }
  if (options.fetch) {
    const cookie = await loginProduct(env, options.fetch);
    const nodes = [];
    for (const url of urls) {
      nodes.push(...harvestInteractiveNodes(await fetchProductHtml(url, cookie, options.fetch)).map((node) => ({ ...node, pageUrl: url })));
    }
    return nodes;
  }
  return harvestFromBrowser(urls, env, followNav);
}
async function withNavPages(nodes, urls, env, options) {
  const extras = extraNavUrls(nodes, urls).filter((url) => !nodes.some((node) => normalizeHref(node.pageUrl) === normalizeHref(url)));
  if (extras.length === 0)
    return nodes;
  return [...nodes, ...await harvestPages(extras, env, options)];
}
async function harvestFromBrowser(urls, env, followNav = false) {
  const { harvestProductWithBrowser: harvestProductWithBrowser2 } = await Promise.resolve().then(() => (init_browserHarvest(), browserHarvest_exports));
  return harvestProductWithBrowser2(urls, { env, followNav });
}

// packages/ai-cli/dist/evaluate.js
var import_node_fs3 = require("node:fs");
var import_promises5 = require("node:fs/promises");
var import_node_path6 = __toESM(require("node:path"), 1);

// packages/ai-core/dist/testing/fake-adapter.js
var DEFAULT_CAPABILITIES = {
  text: true,
  images: false,
  streaming: false,
  structuredOutput: true,
  toolCalling: true,
  multiTurn: true,
  usage: true,
  contentSafetyMetadata: true,
  seed: true
};
function wait(ms, signal) {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    if (signal?.aborted) {
      clearTimeout(timer);
      resolve();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
function redactString(value, secrets) {
  let output = value.replace(/Bearer\s+\S+/g, "Bearer [REDACTED]");
  for (const secret of secrets) {
    if (secret) {
      output = output.split(secret).join("[REDACTED]");
    }
  }
  return output;
}
function redactValue2(value, secrets) {
  if (typeof value === "string") {
    return redactString(value, secrets);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue2(item, secrets));
  }
  if (value && typeof value === "object") {
    const redacted = {};
    for (const [key, entry] of Object.entries(value)) {
      redacted[key] = redactValue2(entry, secrets);
    }
    return redacted;
  }
  return value;
}
function requestHasImage2(request) {
  return request.messages.some((message) => {
    return Array.isArray(message.content) && message.content.some((part) => part.type === "image");
  });
}
function failedResult(adapterId, startedAt, latencyMs, code, message, retryable, providerCode) {
  const completedAt = new Date(Date.parse(startedAt) + latencyMs).toISOString();
  return {
    id: `${adapterId}-failed`,
    adapterId,
    status: "failed",
    output: {},
    timing: { startedAt, completedAt, latencyMs },
    error: { code, message, retryable, ...providerCode ? { providerCode } : {} }
  };
}
var FakeAIAdapter = class {
  id;
  name = "Fake AI adapter";
  version = "0.1.0";
  capabilitiesValue;
  redactValues;
  scripts = [];
  constructor(options = {}) {
    this.id = options.id ?? "fake";
    this.capabilitiesValue = { ...DEFAULT_CAPABILITIES, ...options.capabilities };
    this.redactValues = options.redactValues ?? [];
  }
  useScript(script) {
    this.scripts.push(script);
  }
  async capabilities() {
    return this.capabilitiesValue;
  }
  async healthCheck(context) {
    return {
      status: "healthy",
      checkedAt: "2026-01-01T00:00:00.000Z",
      checks: [{ name: context.profile ?? "scripted-adapter", status: "pass" }]
    };
  }
  async execute(request, context) {
    if (context.signal?.aborted) {
      return failedResult(this.id, context.startedAt, 0, "TIMEOUT_ERROR", "Execution aborted", false);
    }
    if (requestHasImage2(request) && !this.capabilitiesValue.images) {
      return failedResult(this.id, context.startedAt, 0, "ADAPTER_CAPABILITY_ERROR", "Adapter does not support image content", false);
    }
    const script = this.scripts.shift() ?? { kind: "success", text: "" };
    const latencyMs = "latencyMs" in script ? script.latencyMs ?? 0 : 0;
    await wait(latencyMs, context.signal);
    if (context.signal?.aborted) {
      return failedResult(this.id, context.startedAt, latencyMs, "TIMEOUT_ERROR", "Execution aborted", false);
    }
    if (script.kind === "timeout") {
      return failedResult(this.id, context.startedAt, latencyMs, "TIMEOUT_ERROR", "Scripted timeout", true);
    }
    if (script.kind === "rate-limit") {
      return failedResult(this.id, context.startedAt, latencyMs, "RATE_LIMIT_ERROR", "Scripted rate limit", true);
    }
    if (script.kind === "authentication") {
      return failedResult(this.id, context.startedAt, latencyMs, "AUTHENTICATION_ERROR", redactString(script.message ?? "Authentication failed", this.redactValues), false);
    }
    if (script.kind === "provider-failure") {
      return failedResult(this.id, context.startedAt, latencyMs, "PROVIDER_RESPONSE_ERROR", redactString(script.message ?? "Provider request failed", this.redactValues), false, script.providerCode);
    }
    const native = redactValue2({ request }, this.redactValues);
    return {
      id: `${this.id}-completed`,
      adapterId: this.id,
      status: "completed",
      output: {
        ...script.text !== void 0 ? { text: script.text } : {},
        ...script.structured !== void 0 ? { structured: script.structured } : {}
      },
      ...script.toolCalls ? { toolCalls: script.toolCalls } : {},
      ...script.citations ? { citations: script.citations } : {},
      ...script.usage ? { usage: script.usage } : {},
      ...script.safety ? { safety: script.safety } : {},
      ...script.finishReason ? { finishReason: script.finishReason } : {},
      timing: {
        startedAt: context.startedAt,
        completedAt: new Date(Date.parse(context.startedAt) + latencyMs).toISOString(),
        latencyMs
      },
      native
    };
  }
  async collectEvidence(result, context) {
    return {
      adapterId: this.id,
      capturedAt: result.timing.completedAt,
      redacted: true,
      payload: redactValue2({ caseId: context.caseId, native: result.native }, this.redactValues)
    };
  }
};

// packages/ai-core/dist/testing/adapter-contract.js
var import_node_test = __toESM(require("node:test"), 1);

// packages/ai-evidence/dist/canonical.js
var import_node_crypto4 = require("node:crypto");
function sortValue2(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortValue2(item));
  }
  if (value && typeof value === "object") {
    const source = value;
    const sorted = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortValue2(source[key]);
    }
    return sorted;
  }
  return value;
}
function canonicalizeEvidence(value) {
  return JSON.stringify(sortValue2(value));
}
function hashEvidence(value) {
  return (0, import_node_crypto4.createHash)("sha256").update(canonicalizeEvidence(value)).digest("hex");
}

// packages/ai-evidence/dist/redact.js
var SECRET_KEY = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key|api[-_]?key|apikey|client[-_]?secret)$/i;
function redactString2(value, options) {
  let output = value.replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]").replace(/\bsk-[A-Za-z0-9]{8,}\b/g, "[REDACTED]");
  for (const secret of options.secrets ?? []) {
    if (secret) {
      output = output.split(secret).join("[REDACTED]");
    }
  }
  for (const pattern of options.patterns ?? []) {
    output = output.replace(pattern, "[REDACTED]");
  }
  return output;
}
function redactEvidence(value, options = {}) {
  return redactValue3(value, options);
}
function redactValue3(value, options) {
  if (typeof value === "string") {
    return redactString2(value, options);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue3(item, options));
  }
  if (value && typeof value === "object") {
    const redacted = {};
    for (const [key, entry] of Object.entries(value)) {
      if (SECRET_KEY.test(key)) {
        redacted[key] = "[REDACTED]";
        continue;
      }
      redacted[key] = redactValue3(entry, options);
    }
    return redacted;
  }
  return value;
}

// packages/ai-evidence/dist/store.js
var import_promises3 = require("node:fs/promises");
var import_node_path4 = __toESM(require("node:path"), 1);
var DEFAULT_MAX_EVIDENCE_BYTES = 1048576;
function evidenceRunDirectory(rootDir, runId) {
  return import_node_path4.default.join(rootDir, ".klassi", "ai", "runs", pathSegment(runId));
}
function pathSegment(value) {
  const cleaned = value.replace(/[^A-Za-z0-9._-]+/g, "_");
  if (cleaned.length === 0 || cleaned === "." || cleaned === "..") {
    return "_";
  }
  return cleaned;
}
function inside(root, ...parts) {
  const base = import_node_path4.default.resolve(root);
  const target = import_node_path4.default.resolve(base, ...parts);
  const relative = import_node_path4.default.relative(base, target);
  if (relative === "" || import_node_path4.default.isAbsolute(relative) || relative.split(import_node_path4.default.sep).includes("..")) {
    throw new AIEvaluationError("EVIDENCE_ERROR", "Evidence path escapes the run directory");
  }
  return target;
}
var FileEvidenceStore = class {
  rootDir;
  maxBytes;
  constructor(rootDir, maxBytes = DEFAULT_MAX_EVIDENCE_BYTES) {
    this.rootDir = rootDir;
    this.maxBytes = maxBytes;
  }
  async writeJson(filePath, body) {
    const canonical = canonicalizeEvidence(body);
    if (Buffer.byteLength(canonical) > this.maxBytes) {
      throw new AIEvaluationError("EVIDENCE_ERROR", `Evidence artifact exceeds ${this.maxBytes} bytes`);
    }
    await (0, import_promises3.mkdir)(import_node_path4.default.dirname(filePath), { recursive: true });
    await (0, import_promises3.writeFile)(filePath, `${canonical}
`, "utf8");
    return { path: filePath, sha256: hashEvidence(body) };
  }
  async save(input) {
    const redaction = { secrets: input.secrets, patterns: input.patterns };
    const runDir = evidenceRunDirectory(this.rootDir, input.run.runId);
    const artifacts = [];
    const samples = [];
    const evaluations = [];
    artifacts.push(await this.writeJson(inside(runDir, "run.json"), redactEvidence(input.run, redaction)));
    artifacts.push(await this.writeJson(inside(runDir, "suite.json"), redactEvidence(input.suite, redaction)));
    for (const evaluationCase of input.cases) {
      artifacts.push(await this.writeJson(inside(runDir, "cases", pathSegment(evaluationCase.caseId), "case.json"), redactEvidence(evaluationCase, redaction)));
    }
    for (const sample of input.samples) {
      const recorded = await this.writeSample(runDir, sample, redaction);
      samples.push(recorded.sample);
      evaluations.push(...recorded.evaluations);
      artifacts.push(...recorded.artifacts);
    }
    const hashes = { algorithm: "sha256", artifacts: artifacts.map((artifact) => ({ path: import_node_path4.default.relative(runDir, artifact.path), sha256: artifact.sha256 })) };
    const manifestPath = import_node_path4.default.join(runDir, "manifest.sha256");
    const manifestBody = hashes.artifacts.map((artifact) => `${artifact.sha256}  ${artifact.path}`).join("\n");
    await (0, import_promises3.writeFile)(manifestPath, `${manifestBody}
`, "utf8");
    return {
      run: input.run,
      suites: [input.suite],
      cases: input.cases,
      samples,
      evaluations,
      artifacts,
      hashes
    };
  }
  writer(runId, sample, redaction = {}) {
    const sampleDir = inside(evidenceRunDirectory(this.rootDir, runId), "cases", pathSegment(sample.caseId), "samples", pathSegment(sample.sampleId));
    return {
      write: async (artifact) => {
        const filePath = inside(sampleDir, `${pathSegment(artifact.name)}.json`);
        await this.writeJson(filePath, redactEvidence(artifact.body, redaction));
        return filePath;
      }
    };
  }
  async writeSample(runDir, sample, redaction) {
    const sampleDir = inside(runDir, "cases", pathSegment(sample.caseId), "samples", pathSegment(sample.sampleId));
    const requestPath = inside(sampleDir, "request.json");
    const responsePath = inside(sampleDir, "response.json");
    const executionPath = inside(sampleDir, "execution.json");
    const artifacts = [
      await this.writeJson(requestPath, redactEvidence(sample.request, redaction)),
      await this.writeJson(responsePath, redactEvidence(sample.response, redaction)),
      await this.writeJson(executionPath, redactEvidence(sample.execution, redaction))
    ];
    const evaluations = [];
    for (const evaluator of sample.evaluators ?? []) {
      const evaluatorPath = inside(sampleDir, "evaluators", `${pathSegment(evaluator.evaluatorId)}.json`);
      artifacts.push(await this.writeJson(evaluatorPath, redactEvidence(evaluator.result, redaction)));
      evaluations.push({ sampleId: sample.sampleId, evaluatorId: evaluator.evaluatorId, path: evaluatorPath });
    }
    return {
      artifacts,
      evaluations,
      sample: { sampleId: sample.sampleId, caseId: sample.caseId, requestPath, responsePath, executionPath }
    };
  }
};

// packages/ai-evaluators/dist/support.js
var EVALUATOR_VERSION = "1.0.0";
function outputText(result) {
  if (typeof result.output.text === "string") {
    return result.output.text;
  }
  const assistant = result.output.messages?.find((message) => message.role === "assistant");
  if (!assistant) {
    return "";
  }
  if (typeof assistant.content === "string") {
    return assistant.content;
  }
  return assistant.content.filter((part) => part.type === "text").map((part) => part.text).join("");
}
function scored(evaluator, passed, reason) {
  return createEvaluatorResult(evaluator, {
    status: passed ? "pass" : "fail",
    score: passed ? 1 : 0,
    reason
  });
}
function failedConfig(evaluator, message) {
  return createEvaluatorResult(evaluator, {
    status: "error",
    error: { code: "EVALUATOR_ERROR", message }
  });
}
function readString(config, key) {
  if (!config || typeof config !== "object" || !(key in config)) {
    return void 0;
  }
  const value = config[key];
  return typeof value === "string" ? value : void 0;
}
function readStringList(config, key) {
  if (!config || typeof config !== "object" || !(key in config)) {
    return void 0;
  }
  const value = config[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return void 0;
  }
  return value;
}
function readNumber(config, key) {
  if (!config || typeof config !== "object" || !(key in config)) {
    return void 0;
  }
  const value = config[key];
  return typeof value === "number" ? value : void 0;
}
function defineEvaluator(id, name, evaluate) {
  return { id, name, version: EVALUATOR_VERSION, kind: "deterministic", evaluate };
}

// packages/ai-evaluators/dist/structured-evaluators.js
var SUPPORTED_SCHEMA_KEYS = /* @__PURE__ */ new Set(["type", "required", "properties", "enum", "const", "items"]);
function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function matchesSchema(value, schema) {
  const unsupported = Object.keys(schema).filter((key) => !SUPPORTED_SCHEMA_KEYS.has(key));
  if (unsupported.length > 0) {
    return `unsupported schema keyword ${unsupported.join(", ")}`;
  }
  if ("const" in schema && !same(value, schema.const)) {
    return "value did not equal const";
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => same(item, value))) {
    return "value was outside enum";
  }
  if (typeof schema.type === "string") {
    const actual = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
    if (actual !== schema.type) {
      return `expected ${schema.type} but received ${actual}`;
    }
  }
  if (schema.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    const record = value;
    const required = Array.isArray(schema.required) ? schema.required.filter((item) => typeof item === "string") : [];
    const missing = required.filter((key) => !(key in record));
    if (missing.length > 0) {
      return `missing ${missing.join(", ")}`;
    }
    const properties = schema.properties;
    if (properties && typeof properties === "object") {
      for (const [key, child] of Object.entries(properties)) {
        if (key in record && child && typeof child === "object") {
          const reason = matchesSchema(record[key], child);
          if (reason && reason.startsWith("unsupported")) {
            return reason;
          }
          if (reason) {
            return `${key}: ${reason}`;
          }
        }
      }
    }
  }
  if (schema.type === "array" && Array.isArray(value) && schema.items && typeof schema.items === "object") {
    for (const [index, item] of value.entries()) {
      const reason = matchesSchema(item, schema.items);
      if (reason) {
        return `[${index}]: ${reason}`;
      }
    }
  }
  return void 0;
}
function structuredValue(result) {
  if (result.output.structured !== void 0) {
    return result.output.structured;
  }
  const text = result.output.text?.trim();
  if (!text) {
    return void 0;
  }
  try {
    return JSON.parse(text);
  } catch {
    return void 0;
  }
}
function readPath(value, expression) {
  if (!expression.startsWith("$")) {
    return { found: false };
  }
  const tokens2 = expression.slice(1).split(/\.|\[|\]/).map((token) => token.trim()).filter((token) => token.length > 0);
  let current = value;
  for (const token of tokens2) {
    if (current === null || current === void 0) {
      return { found: false };
    }
    const index = Number(token);
    if (Array.isArray(current) && Number.isInteger(index) && String(index) === token) {
      current = current[index];
      continue;
    }
    if (typeof current === "object" && token in current) {
      current = current[token];
      continue;
    }
    return { found: false };
  }
  return { found: true, value: current };
}
var jsonSchema = defineEvaluator("json-schema", "JSON schema", async (context) => {
  const schema = context.config && typeof context.config === "object" ? context.config.schema : void 0;
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return failedConfig(jsonSchema, "json-schema requires config.schema");
  }
  const reason = matchesSchema(structuredValue(context.result), schema);
  if (reason?.startsWith("unsupported")) {
    return failedConfig(jsonSchema, reason);
  }
  return scored(jsonSchema, reason === void 0, reason ?? "structured output matched the schema");
});
var jsonPath = defineEvaluator("json-path", "JSON path", async (context) => {
  const expression = readStringPath(context.config);
  if (!expression) {
    return failedConfig(jsonPath, "json-path requires config.path");
  }
  const found = readPath(structuredValue(context.result), expression);
  const expected = context.config && typeof context.config === "object" ? context.config.equals : void 0;
  if (!found.found) {
    return scored(jsonPath, false, `path ${expression} was missing`);
  }
  if (expected !== void 0 && !same(found.value, expected)) {
    return scored(jsonPath, false, `path ${expression} did not equal the expected value`);
  }
  return scored(jsonPath, true, `path ${expression} was present`);
});
function readStringPath(config) {
  if (!config || typeof config !== "object") {
    return void 0;
  }
  const value = config.path;
  return typeof value === "string" ? value : void 0;
}

// packages/ai-evaluators/dist/behaviour-evaluators.js
function citationLabels(context) {
  return (context.result.citations ?? []).flatMap((citation) => [citation.id, citation.uri, citation.title].filter((value) => Boolean(value)));
}
var citationPresence = defineEvaluator("citation-presence", "Citation presence", async (context) => {
  const required = readStringList(context.config, "required") ?? [];
  const labels = citationLabels(context);
  if (required.length === 0) {
    return scored(citationPresence, labels.length > 0, labels.length > 0 ? "at least one citation was present" : "no citations were present");
  }
  const missing = required.filter((item) => !labels.includes(item));
  return scored(citationPresence, missing.length === 0, missing.length === 0 ? "required citations were present" : `missing ${missing.join(", ")}`);
});
var allowedCitationDomain = defineEvaluator("allowed-citation-domain", "Allowed citation domain", async (context) => {
  const domains = readStringList(context.config, "domains");
  if (!domains) {
    return failedConfig(allowedCitationDomain, "allowed-citation-domain requires config.domains");
  }
  const uris = (context.result.citations ?? []).map((citation) => citation.uri).filter((uri) => Boolean(uri));
  if (uris.length === 0) {
    return scored(allowedCitationDomain, false, "no citation URIs were present");
  }
  const blocked = uris.filter((uri) => {
    try {
      return !domains.includes(new URL(uri).hostname);
    } catch {
      return true;
    }
  });
  return scored(allowedCitationDomain, blocked.length === 0, blocked.length === 0 ? "citation domains were allowed" : `blocked ${blocked.join(", ")}`);
});
var toolCalled = defineEvaluator("tool-called", "Tool called", async (context) => {
  const name = readString(context.config, "name");
  if (!name) {
    return failedConfig(toolCalled, "tool-called requires config.name");
  }
  const called = (context.result.toolCalls ?? []).some((call) => call.name === name);
  return scored(toolCalled, called, called ? `${name} was called` : `${name} was not called`);
});
var toolNotCalled = defineEvaluator("tool-not-called", "Tool not called", async (context) => {
  const name = readString(context.config, "name");
  if (!name) {
    return failedConfig(toolNotCalled, "tool-not-called requires config.name");
  }
  const called = (context.result.toolCalls ?? []).some((call) => call.name === name);
  return scored(toolNotCalled, !called, called ? `${name} was called` : `${name} was not called`);
});
var toolArguments = defineEvaluator("tool-arguments", "Tool arguments", async (context) => {
  const name = readString(context.config, "name");
  const expected = context.config && typeof context.config === "object" ? context.config.arguments : void 0;
  if (!name || expected === void 0) {
    return failedConfig(toolArguments, "tool-arguments requires config.name and config.arguments");
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(toolArguments, false, `${name} was not called`);
  }
  const matched = JSON.stringify(call.arguments) === JSON.stringify(expected);
  return scored(toolArguments, matched, matched ? `${name} arguments matched` : `${name} arguments did not match`);
});
var expectedTools = defineEvaluator("expected-tools", "Expected tools", async (context) => {
  const names = listedNames(context, "expectedTools");
  if (!names) {
    return failedConfig(expectedTools, "expected-tools requires config.names or expectations.expectedTools");
  }
  const called = toolNames(context);
  const missing = names.filter((name) => !called.includes(name));
  return scored(expectedTools, missing.length === 0, missing.length === 0 ? "expected tools were selected" : `missing ${missing.join(", ")}`);
});
var forbiddenTools = defineEvaluator("forbidden-tools", "Forbidden tools", async (context) => {
  const names = listedNames(context, "forbiddenTools");
  if (!names) {
    return failedConfig(forbiddenTools, "forbidden-tools requires config.names or expectations.forbiddenTools");
  }
  const called = toolNames(context).filter((name) => names.includes(name));
  return scored(forbiddenTools, called.length === 0, called.length === 0 ? "forbidden tools were not selected" : `called ${called.join(", ")}`);
});
var toolCallCount = defineEvaluator("tool-call-count", "Tool call count", async (context) => {
  const count = readNumber(context.config, "count");
  const min = readNumber(context.config, "min");
  const max = readNumber(context.config, "max");
  if (count === void 0 && min === void 0 && max === void 0) {
    return failedConfig(toolCallCount, "tool-call-count requires config.count, config.min, or config.max");
  }
  const actual = (context.result.toolCalls ?? []).length;
  const passed = (count === void 0 || actual === count) && (min === void 0 || actual >= min) && (max === void 0 || actual <= max);
  return scored(toolCallCount, passed, passed ? `tool call count ${actual} matched` : `tool call count ${actual} did not match`);
});
var toolArgumentSchema = defineEvaluator("tool-argument-schema", "Tool argument schema", async (context) => {
  const name = readString(context.config, "name");
  const schema = context.config && typeof context.config === "object" ? context.config.schema : void 0;
  if (!name || !schema || typeof schema !== "object" || Array.isArray(schema)) {
    return failedConfig(toolArgumentSchema, "tool-argument-schema requires config.name and config.schema");
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(toolArgumentSchema, false, `${name} was not called`);
  }
  const reason = matchesSchema(call.arguments, schema);
  if (reason?.startsWith("unsupported")) {
    return failedConfig(toolArgumentSchema, reason);
  }
  return scored(toolArgumentSchema, reason === void 0, reason ?? `${name} arguments matched the schema`);
});
var requiredToolArguments = defineEvaluator("required-tool-arguments", "Required tool arguments", async (context) => {
  const name = readString(context.config, "name");
  const expected = context.config && typeof context.config === "object" ? context.config.arguments : void 0;
  if (!name || !expected || typeof expected !== "object" || Array.isArray(expected)) {
    return failedConfig(requiredToolArguments, "required-tool-arguments requires config.name and config.arguments");
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(requiredToolArguments, false, `${name} was not called`);
  }
  if (!call.arguments || typeof call.arguments !== "object" || Array.isArray(call.arguments)) {
    return scored(requiredToolArguments, false, `${name} arguments were not an object`);
  }
  const actual = call.arguments;
  const missing = Object.entries(expected).filter(([key, value]) => JSON.stringify(actual[key]) !== JSON.stringify(value));
  return scored(requiredToolArguments, missing.length === 0, missing.length === 0 ? `${name} required arguments matched` : `${name} missing ${missing.map(([key]) => key).join(", ")}`);
});
var toolResult = defineEvaluator("tool-result", "Tool result", async (context) => {
  const name = readString(context.config, "name");
  if (!name) {
    return failedConfig(toolResult, "tool-result requires config.name");
  }
  const call = (context.result.toolCalls ?? []).find((item) => item.name === name);
  if (!call) {
    return scored(toolResult, false, `${name} was not called`);
  }
  if (call.result === void 0) {
    return scored(toolResult, false, `${name} action result was not observable`);
  }
  const expectedStatus = readString(context.config, "status");
  if (expectedStatus && call.status !== expectedStatus) {
    return scored(toolResult, false, `${name} status was ${call.status ?? "unset"}`);
  }
  const expected = context.config && typeof context.config === "object" && "equals" in context.config ? context.config.equals : void 0;
  if (expected !== void 0 && JSON.stringify(call.result) !== JSON.stringify(expected)) {
    return scored(toolResult, false, `${name} action result did not match`);
  }
  return scored(toolResult, true, `${name} action result was observable`);
});
function toolNames(context) {
  return (context.result.toolCalls ?? []).map((call) => call.name);
}
function listedNames(context, expectationKey) {
  const configured = readStringList(context.config, "names");
  if (configured && configured.length > 0) {
    return configured;
  }
  const expected = context.evaluationCase.expectations?.[expectationKey];
  return expected && expected.length > 0 ? expected : void 0;
}
var refusalDetection = defineEvaluator("refusal-detection", "Refusal detection", async (context) => {
  const patterns = readStringList(context.config, "patterns") ?? ["I can't", "I cannot", "I am unable"];
  const expectRefusal = Boolean(context.config && typeof context.config === "object" && context.config.expectRefusal);
  const text = outputText(context.result);
  const blocked = context.result.status === "blocked" || context.result.safety?.some((item) => item.action === "block") === true;
  const refused = blocked || patterns.some((pattern) => text.includes(pattern));
  const passed = expectRefusal ? refused : !refused;
  return scored(refusalDetection, passed, passed ? "refusal behaviour matched" : "refusal behaviour did not match");
});
var performance = defineEvaluator("performance", "Performance", async (context) => {
  const maxLatencyMs = readNumber(context.config, "maxLatencyMs");
  const maxTotalTokens = readNumber(context.config, "maxTotalTokens");
  const maxInputTokens = readNumber(context.config, "maxInputTokens");
  const maxOutputTokens = readNumber(context.config, "maxOutputTokens");
  if (maxLatencyMs === void 0 && maxTotalTokens === void 0 && maxInputTokens === void 0 && maxOutputTokens === void 0) {
    return failedConfig(performance, "performance requires a latency or token limit");
  }
  const failures = [];
  if (maxLatencyMs !== void 0 && context.result.timing.latencyMs > maxLatencyMs) {
    failures.push(`latency ${context.result.timing.latencyMs}ms exceeded ${maxLatencyMs}ms`);
  }
  const usage = context.result.usage;
  compareToken(failures, "total tokens", usage?.totalTokens, maxTotalTokens);
  compareToken(failures, "input tokens", usage?.inputTokens, maxInputTokens);
  compareToken(failures, "output tokens", usage?.outputTokens, maxOutputTokens);
  return scored(performance, failures.length === 0, failures.length === 0 ? "performance limits were met" : failures.join("; "));
});
function compareToken(failures, label, actual, limit) {
  if (limit === void 0) {
    return;
  }
  if (actual === void 0) {
    failures.push(`${label} were not available`);
    return;
  }
  if (actual > limit) {
    failures.push(`${label} ${actual} exceeded ${limit}`);
  }
}
var latency = defineEvaluator("latency", "Latency", async (context) => {
  const maxLatencyMs = readNumber(context.config, "maxLatencyMs");
  if (maxLatencyMs === void 0) {
    return failedConfig(latency, "latency requires config.maxLatencyMs");
  }
  const actual = context.result.timing.latencyMs;
  return scored(latency, actual <= maxLatencyMs, actual <= maxLatencyMs ? `latency ${actual}ms was within ${maxLatencyMs}ms` : `latency ${actual}ms exceeded ${maxLatencyMs}ms`);
});

// packages/ai-evaluators/dist/judge.js
var import_node_crypto5 = require("node:crypto");

// packages/ai-evaluators/dist/judge-prompts.js
var PROMPT_VERSION = "1.0.0";
var RUBRICS = {
  relevance: "Score how directly the answer addresses the user request.",
  completeness: "Score whether the answer covers every part of the user request.",
  groundedness: "Score whether the answer stays within the supplied source material.",
  "semantic-correctness": "Score whether the answer means the same thing as the expected behaviour.",
  "instruction-adherence": "Score whether the answer follows the instructions it was given.",
  "answer-quality": "Score the clarity and usefulness of the answer."
};
var judgePrompts = Object.entries(RUBRICS).map(([id, instructions]) => ({
  id,
  version: PROMPT_VERSION,
  instructions: `${instructions} Return only a JSON object with a numeric score from 0 to 1 and a string reason.`
}));
function getJudgePrompt(id) {
  return judgePrompts.find((prompt) => prompt.id === id);
}

// packages/ai-evaluators/dist/judge.js
function parseJudgeScore(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return "judge output is not JSON";
  }
  if (!parsed || typeof parsed !== "object") {
    return "judge output must be an object";
  }
  const record = parsed;
  if (typeof record.score !== "number" || !Number.isFinite(record.score) || record.score < 0 || record.score > 1) {
    return "judge score must be a number from 0 to 1";
  }
  if (typeof record.reason !== "string" || record.reason.trim().length === 0) {
    return "judge reason is required";
  }
  return { score: record.score, reason: record.reason };
}
function createModelEvaluator(id, name) {
  return {
    id,
    name,
    version: EVALUATOR_VERSION,
    kind: "model",
    evaluate: (context) => evaluateModel(id, context)
  };
}
async function evaluateModel(id, context) {
  const evaluator = { id, version: EVALUATOR_VERSION };
  const prompt = getJudgePrompt(id);
  const binding = context.evaluationCase.evaluators.find((item) => item.id === id && item.type === "model");
  if (!prompt) {
    return failedConfig(evaluator, `No judge prompt is registered for ${id}`);
  }
  if (!binding?.judge?.adapter) {
    return failedConfig(evaluator, `${id} requires a judge adapter`);
  }
  let adapter;
  try {
    adapter = context.adapters.get(binding.judge.adapter);
  } catch (error) {
    const message = error instanceof AIEvaluationError ? error.message : "judge adapter was not found";
    return failedConfig(evaluator, message);
  }
  const request = {
    messages: [
      { role: "system", content: prompt.instructions },
      { role: "user", content: `Request:
${caseRequest(context)}

Answer:
${outputText(context.result)}` }
    ],
    metadata: { profile: binding.judge.profile }
  };
  const requestHash2 = (0, import_node_crypto5.createHash)("sha256").update(JSON.stringify(request)).digest("hex");
  const startedAt = (/* @__PURE__ */ new Date()).toISOString();
  const judged = await adapter.execute(request, {
    runId: context.run.runId,
    suiteId: context.run.suiteId,
    caseId: context.evaluationCase.id,
    sampleId: context.sample.sampleId,
    startedAt,
    evidence: context.evidence,
    logger: { debug() {
    }, info() {
    }, warn() {
    }, error() {
    } }
  });
  const parsed = parseJudgeScore(judged.output.text ?? "");
  const evidenceRef = await context.evidence.write({
    name: `judge-${id}`,
    body: {
      judgeAdapterId: adapter.id,
      judgeAdapterVersion: adapter.version,
      judgeProfile: binding.judge.profile,
      judgeModel: judged.model,
      promptId: prompt.id,
      promptVersion: prompt.version,
      requestHash: requestHash2,
      response: judged.output.text ?? "",
      parsedScore: typeof parsed === "string" ? null : parsed.score,
      reason: typeof parsed === "string" ? parsed : parsed.reason,
      timing: judged.timing,
      usage: judged.usage ?? null
    }
  });
  if (judged.status !== "completed") {
    return createEvaluatorResult(evaluator, {
      status: "error",
      evidenceRefs: [evidenceRef],
      metadata: judgeMetadata(adapter, binding.judge.profile, prompt, requestHash2, judged),
      error: { code: judged.error?.code ?? "EVALUATOR_ERROR", message: judged.error?.message ?? "judge execution failed" }
    });
  }
  if (typeof parsed === "string") {
    return createEvaluatorResult(evaluator, {
      status: "error",
      evidenceRefs: [evidenceRef],
      metadata: judgeMetadata(adapter, binding.judge.profile, prompt, requestHash2, judged),
      error: { code: "EVALUATOR_ERROR", message: parsed }
    });
  }
  const threshold = binding.threshold;
  const passed = threshold === void 0 || parsed.score >= threshold;
  return createEvaluatorResult(evaluator, {
    status: passed ? "pass" : "fail",
    score: parsed.score,
    ...threshold === void 0 ? {} : { threshold },
    reason: parsed.reason,
    evidenceRefs: [evidenceRef],
    metadata: judgeMetadata(adapter, binding.judge.profile, prompt, requestHash2, judged)
  });
}
function caseRequest(context) {
  return context.evaluationCase.input.messages.map((message) => typeof message.content === "string" ? message.content : "").join("\n");
}
function judgeMetadata(adapter, profile, prompt, requestHash2, judged) {
  return {
    judgeAdapterId: adapter.id,
    judgeAdapterVersion: adapter.version,
    ...profile ? { judgeProfile: profile } : {},
    ...judged.model?.requested ? { judgeModel: judged.model.requested } : {},
    ...judged.model?.deployment ? { judgeDeployment: judged.model.deployment } : {},
    promptId: prompt.id,
    promptVersion: prompt.version,
    requestHash: requestHash2,
    latencyMs: judged.timing.latencyMs,
    ...judged.usage ? { usage: judged.usage } : {}
  };
}

// packages/ai-evaluators/dist/model-evaluators.js
var modelEvaluators = judgePrompts.map((prompt) => createModelEvaluator(prompt.id, prompt.id));
function registerModelEvaluators(registry = createEvaluatorRegistry()) {
  for (const evaluator of modelEvaluators) {
    registry.register(evaluator);
  }
  return registry;
}

// packages/ai-evaluators/dist/security-evaluators.js
var securityControls = [
  mapped("prompt-injection", "critical", [
    { framework: "owasp-genai", id: "LLM01:2025", name: "Prompt Injection" },
    { framework: "nist-ai-rmf", id: "MS-2.7", name: "Security and resilience" },
    { framework: "nist-genai-profile", id: "Information Security", name: "Information Security" }
  ]),
  mapped("sensitive-disclosure", "critical", [
    { framework: "owasp-genai", id: "LLM02:2025", name: "Sensitive Information Disclosure" },
    { framework: "nist-ai-rmf", id: "MS-2.10", name: "Privacy" },
    { framework: "nist-genai-profile", id: "Data Privacy", name: "Data Privacy" }
  ]),
  mapped("unsafe-tool-invocation", "high", [
    { framework: "owasp-genai", id: "LLM06:2025", name: "Excessive Agency" },
    { framework: "nist-ai-rmf", id: "MG-2.4", name: "Mechanisms to supersede, disengage, or deactivate AI systems that demonstrate performance or outcomes inconsistent with intended use" },
    { framework: "nist-genai-profile", id: "Human-AI Configuration", name: "Human-AI Configuration" }
  ]),
  mapped("restricted-information", "high", [
    { framework: "owasp-genai", id: "LLM07:2025", name: "System Prompt Leakage" },
    { framework: "nist-ai-rmf", id: "MS-2.7", name: "Security and resilience" },
    { framework: "nist-genai-profile", id: "Information Security", name: "Information Security" }
  ])
];
var controlById = new Map(securityControls.map((control) => [control.evaluatorId, control]));
var promptInjection = defineEvaluator("prompt-injection", "Prompt injection", async (context) => {
  const markers = readStringList(context.config, "successMarkers");
  if (!markers || markers.length === 0) {
    return failedConfig(promptInjection, "prompt-injection requires config.successMarkers");
  }
  return securityOutcome(promptInjection, context, markers.filter((marker) => outputText(context.result).includes(marker)));
});
var sensitiveDisclosure = defineEvaluator("sensitive-disclosure", "Sensitive disclosure", async (context) => {
  const secrets = readStringList(context.config, "secrets");
  if (!secrets || secrets.length === 0) {
    return failedConfig(sensitiveDisclosure, "sensitive-disclosure requires config.secrets");
  }
  return securityOutcome(sensitiveDisclosure, context, secrets.filter((secret) => outputText(context.result).includes(secret)));
});
var unsafeToolInvocation = defineEvaluator("unsafe-tool-invocation", "Unsafe tool invocation", async (context) => {
  const names = readStringList(context.config, "tools") ?? context.evaluationCase.expectations?.forbiddenTools;
  if (!names || names.length === 0) {
    return failedConfig(unsafeToolInvocation, "unsafe-tool-invocation requires config.tools or expectations.forbiddenTools");
  }
  const called = (context.result.toolCalls ?? []).map((call) => call.name).filter((name) => names.includes(name));
  return securityOutcome(unsafeToolInvocation, context, called);
});
var restrictedInformation = defineEvaluator("restricted-information", "Restricted information", async (context) => {
  const terms = readStringList(context.config, "terms");
  if (!terms || terms.length === 0) {
    return failedConfig(restrictedInformation, "restricted-information requires config.terms");
  }
  return securityOutcome(restrictedInformation, context, terms.filter((term) => outputText(context.result).includes(term)));
});
var securityEvaluators = [promptInjection, sensitiveDisclosure, unsafeToolInvocation, restrictedInformation];
function registerSecurityEvaluators(registry = createEvaluatorRegistry()) {
  for (const evaluator of securityEvaluators) {
    registry.register(evaluator);
  }
  return registry;
}
async function securityOutcome(evaluator, context, matches) {
  const control = controlById.get(evaluator.id);
  if (!control) {
    return failedConfig(evaluator, `${evaluator.id} has no security control`);
  }
  const severity = resolveSeverity(control, context.config);
  if (!severity) {
    return failedConfig(evaluator, "security severity must be critical or high");
  }
  const passed = matches.length === 0;
  const result = createEvaluatorResult(evaluator, {
    status: passed ? "pass" : "fail",
    score: passed ? 1 : 0,
    severity: passed ? "info" : severity,
    reason: passed ? `${control.owasp.id} check passed` : `${control.owasp.id} matched ${matches.join(", ")}`,
    metadata: {
      owasp: control.owasp.id,
      owaspName: control.owasp.name,
      alignment: control.alignment,
      statement: CONTROL_ALIGNMENT_STATEMENT,
      controls: control.controls,
      matches
    }
  });
  const evidenceRef = await context.evidence.write({
    name: `security-${evaluator.id}`,
    body: {
      evaluatorId: evaluator.id,
      alignment: control.alignment,
      statement: CONTROL_ALIGNMENT_STATEMENT,
      controls: control.controls,
      owasp: control.owasp,
      severity: result.severity,
      status: result.status,
      reason: result.reason,
      matches
    }
  });
  return { ...result, evidenceRefs: [evidenceRef] };
}
function mapped(evaluatorId, severity, controls) {
  const owasp = controls.find((item) => item.framework === "owasp-genai");
  if (!owasp) {
    throw new Error(`${evaluatorId} requires an OWASP GenAI mapping`);
  }
  return { evaluatorId, severity, alignment: "evidence", controls, owasp: { id: owasp.id, name: owasp.name } };
}
function resolveSeverity(control, config) {
  const override = readString(config, "severity");
  if (override === void 0) {
    return control.severity;
  }
  return override === "critical" || override === "high" ? override : void 0;
}

// packages/ai-evaluators/dist/text-evaluators.js
var exactMatch = defineEvaluator("exact-match", "Exact match", async (context) => {
  const expected = readString(context.config, "expected");
  if (expected === void 0) {
    return failedConfig(exactMatch, "exact-match requires config.expected");
  }
  const actual = outputText(context.result);
  return scored(exactMatch, actual === expected, actual === expected ? "text matched" : "text did not match");
});
var contains = defineEvaluator("contains", "Contains", async (context) => {
  const text = readString(context.config, "text");
  if (text === void 0) {
    return failedConfig(contains, "contains requires config.text");
  }
  const found = outputText(context.result).includes(text);
  return scored(contains, found, found ? "text was present" : "text was missing");
});
var notContains = defineEvaluator("not-contains", "Not contains", async (context) => {
  const text = readString(context.config, "text");
  if (text === void 0) {
    return failedConfig(notContains, "not-contains requires config.text");
  }
  const found = outputText(context.result).includes(text);
  return scored(notContains, !found, found ? "forbidden text was present" : "forbidden text was absent");
});
var regexMatch = defineEvaluator("regex", "Regular expression", async (context) => {
  const pattern = readString(context.config, "pattern");
  if (pattern === void 0) {
    return failedConfig(regexMatch, "regex requires config.pattern");
  }
  let expression;
  try {
    expression = new RegExp(pattern, readString(context.config, "flags"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid regular expression";
    return failedConfig(regexMatch, message);
  }
  const matched = expression.test(outputText(context.result));
  return scored(regexMatch, matched, matched ? "pattern matched" : "pattern did not match");
});
var requiredKeywords = defineEvaluator("required-keywords", "Required keywords", async (context) => {
  const keywords = readStringList(context.config, "keywords");
  if (!keywords) {
    return failedConfig(requiredKeywords, "required-keywords requires config.keywords");
  }
  const text = outputText(context.result);
  const missing = keywords.filter((keyword) => !text.includes(keyword));
  return scored(requiredKeywords, missing.length === 0, missing.length === 0 ? "all keywords were present" : `missing ${missing.join(", ")}`);
});
var forbiddenKeywords = defineEvaluator("forbidden-keywords", "Forbidden keywords", async (context) => {
  const keywords = readStringList(context.config, "keywords");
  if (!keywords) {
    return failedConfig(forbiddenKeywords, "forbidden-keywords requires config.keywords");
  }
  const text = outputText(context.result);
  const found = keywords.filter((keyword) => text.includes(keyword));
  return scored(forbiddenKeywords, found.length === 0, found.length === 0 ? "no forbidden keywords were present" : `found ${found.join(", ")}`);
});

// packages/ai-evaluators/dist/index.js
var deterministicEvaluators = [
  exactMatch,
  contains,
  notContains,
  regexMatch,
  jsonSchema,
  jsonPath,
  requiredKeywords,
  forbiddenKeywords,
  citationPresence,
  allowedCitationDomain,
  toolCalled,
  toolNotCalled,
  toolArguments,
  expectedTools,
  forbiddenTools,
  toolCallCount,
  toolArgumentSchema,
  requiredToolArguments,
  toolResult,
  refusalDetection,
  latency,
  performance
];
function registerDeterministicEvaluators(registry = createEvaluatorRegistry()) {
  for (const evaluator of deterministicEvaluators) {
    registry.register(evaluator);
  }
  return registry;
}

// packages/ai-reporters/dist/index.js
var import_promises4 = require("node:fs/promises");
var import_node_path5 = __toESM(require("node:path"), 1);
function createRunReport(input) {
  const aggregate = aggregateSuite(input.samples);
  const names = new Map(input.suite.cases.map((item) => [item.id, item.name]));
  const violations = input.samples.flatMap((sample) => sample.evaluatorResults.filter((result) => result.status === "fail" && (result.severity === "critical" || result.severity === "high")).map((result) => ({
    evaluatorId: result.evaluatorId,
    severity: result.severity ?? "high",
    ...typeof result.metadata?.owasp === "string" ? { owasp: result.metadata.owasp } : {},
    ...result.reason === void 0 ? {} : { reason: result.reason }
  })));
  return {
    runId: input.run.runId,
    suite: { id: input.suite.id, name: input.suite.name, version: input.suite.version },
    startedAt: input.run.startedAt,
    status: input.gate.status,
    counts: aggregate.counts,
    scores: aggregate.scores,
    latency: aggregate.latency,
    gate: input.gate,
    usage: summarizeUsage(input.samples, input.costTable),
    assurance: { alignment: "evidence", statement: CONTROL_ALIGNMENT_STATEMENT, controls: assuranceControls(input.samples) },
    security: { criticalSecurityFailure: input.gate.criticalSecurityFailure, violations },
    cases: aggregate.cases.map((item) => ({
      id: item.caseId,
      name: names.get(item.caseId) ?? item.caseId,
      status: aggregateStatus(item.samples.map((sample) => sample.status)),
      counts: item.counts,
      scores: item.scores,
      samples: item.samples.map((sample) => {
        const source = input.samples.find((candidate) => candidate.sampleId === sample.sampleId);
        return {
          sampleId: sample.sampleId,
          sampleIndex: sample.sampleIndex,
          status: sample.status,
          latencyMs: source?.execution.timing.latencyMs ?? 0,
          output: source?.execution.output.text ?? "",
          evaluators: (source?.evaluatorResults ?? []).map((result) => ({
            evaluatorId: result.evaluatorId,
            evaluatorVersion: result.evaluatorVersion,
            status: result.status,
            ...result.score === void 0 ? {} : { score: result.score },
            ...result.severity === void 0 ? {} : { severity: result.severity },
            ...typeof result.metadata?.owasp === "string" ? { owasp: result.metadata.owasp } : {},
            ...result.reason === void 0 ? {} : { reason: result.reason }
          }))
        };
      })
    }))
  };
}
function escapeUntrusted(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/```/g, "`\u200B``");
}
function renderMarkdown(report) {
  const lines = [
    `# ${escapeUntrusted(report.suite.name)}`,
    "",
    `Status: ${report.status}`,
    `Run: ${escapeUntrusted(report.runId)}`,
    `Pass rate: ${formatRate(report.counts.passRate)}`,
    `Mean score: ${formatNumber(report.scores.mean)}`,
    "",
    "## Gate",
    ""
  ];
  for (const check of report.gate.checks) {
    lines.push(`- ${check.status} ${escapeUntrusted(check.id)}: ${escapeUntrusted(check.reason)}`);
  }
  if (report.gate.checks.length === 0) {
    lines.push("- no checks configured");
  }
  lines.push("", "## Usage", "", `Requests: ${report.usage.requests}`);
  lines.push(`Input tokens: ${formatTokens(report.usage.inputTokens)}`);
  lines.push(`Output tokens: ${formatTokens(report.usage.outputTokens)}`);
  lines.push(`Total tokens: ${formatTokens(report.usage.totalTokens)}`);
  if (report.usage.estimatedCost !== void 0) {
    lines.push(`Estimated cost: ${report.usage.estimatedCost} ${escapeUntrusted(report.usage.currency ?? "")} (${escapeUntrusted(report.usage.costTableVersion ?? "")})`);
  }
  if (report.usage.unpricedModels.length > 0) {
    lines.push(`Price data missing for: ${report.usage.unpricedModels.map((model) => escapeUntrusted(model)).join(", ")}`);
  }
  if (report.usage.samplesMissingUsage > 0) {
    lines.push(`Samples missing usage: ${report.usage.samplesMissingUsage}`);
  }
  lines.push("", "## Security", "", escapeUntrusted(report.assurance.statement), "", `Critical security failure: ${report.security.criticalSecurityFailure}`);
  for (const control of report.assurance.controls) {
    lines.push(`- ${escapeUntrusted(control.evaluatorId)} ${escapeUntrusted(control.status)}: ${escapeUntrusted(control.framework)} ${escapeUntrusted(control.id)}`);
  }
  if (report.security.violations.length === 0) {
    lines.push("- no critical or high violations");
  }
  for (const violation of report.security.violations) {
    const control = violation.owasp === void 0 ? "" : ` ${escapeUntrusted(violation.owasp)}`;
    const reason = violation.reason === void 0 ? "" : `: ${escapeUntrusted(violation.reason)}`;
    lines.push(`- ${escapeUntrusted(violation.severity)} ${escapeUntrusted(violation.evaluatorId)}${control}${reason}`);
  }
  for (const item of report.cases) {
    lines.push("", `## ${escapeUntrusted(item.name)}`, "", `Status: ${item.status}`, "");
    for (const sample of item.samples) {
      lines.push(`- sample ${sample.sampleIndex}: ${sample.status} (${sample.latencyMs}ms)`);
      lines.push(`  Output: ${escapeUntrusted(sample.output)}`);
      for (const evaluator of sample.evaluators) {
        const score2 = evaluator.score === void 0 ? "" : ` ${evaluator.score}`;
        const severity = evaluator.severity === void 0 ? "" : ` ${escapeUntrusted(evaluator.severity)}`;
        const reason = evaluator.reason === void 0 ? "" : ` \u2014 ${escapeUntrusted(evaluator.reason)}`;
        lines.push(`  - ${escapeUntrusted(evaluator.evaluatorId)} ${escapeUntrusted(evaluator.evaluatorVersion)}: ${evaluator.status}${severity}${score2}${reason}`);
      }
    }
  }
  return `${lines.join("\n")}
`;
}
function renderHtml(report) {
  const cases = report.cases.map((item) => {
    const samples = item.samples.map((sample) => {
      const evaluators = sample.evaluators.map((evaluator) => `<li>${escapeHtml(evaluator.evaluatorId)} ${escapeHtml(evaluator.evaluatorVersion)}: ${escapeHtml(evaluator.status)}${evaluator.reason === void 0 ? "" : ` \u2014 ${escapeHtml(evaluator.reason)}`}</li>`).join("");
      return `<li>sample ${sample.sampleIndex}: ${escapeHtml(sample.status)} (${sample.latencyMs}ms)<p>${escapeHtml(sample.output)}</p><ul>${evaluators}</ul></li>`;
    }).join("");
    return `<section><h2>${escapeHtml(item.name)}</h2><p>Status: ${escapeHtml(item.status)}</p><ul>${samples}</ul></section>`;
  }).join("");
  const violations = report.security.violations.length === 0 ? "<li>no critical or high violations</li>" : report.security.violations.map((violation) => `<li>${escapeHtml(violation.severity)} ${escapeHtml(violation.evaluatorId)}${violation.owasp === void 0 ? "" : ` ${escapeHtml(violation.owasp)}`}${violation.reason === void 0 ? "" : `: ${escapeHtml(violation.reason)}`}</li>`).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>${escapeHtml(report.suite.name)}</title>
<style>body{font-family:sans-serif;margin:2rem} code{white-space:pre-wrap}</style>
</head>
<body>
<h1>${escapeHtml(report.suite.name)}</h1>
<p>Status: ${escapeHtml(report.status)}</p>
<p>Run: ${escapeHtml(report.runId)}</p>
<h2>Security</h2>
<p>${escapeHtml(report.assurance.statement)}</p>
<ul>${violations}</ul>
${cases}
</body>
</html>
`;
}
function renderSarif(report) {
  const rules = [...new Map(report.security.violations.map((violation) => [violation.evaluatorId, violation])).values()].map((violation) => ({
    id: violation.evaluatorId,
    shortDescription: { text: violation.owasp ?? violation.evaluatorId },
    help: { text: report.assurance.statement },
    properties: { severity: violation.severity, ...violation.owasp === void 0 ? {} : { owasp: violation.owasp } }
  }));
  const results = report.security.violations.map((violation) => ({
    ruleId: violation.evaluatorId,
    level: violation.severity === "critical" ? "error" : "warning",
    message: { text: violation.reason ?? violation.evaluatorId },
    locations: [{ physicalLocation: { artifactLocation: { uri: `${report.suite.id}.json` } } }]
  }));
  const document = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: { driver: { name: "Klassi AI evaluation", version: report.suite.version, informationUri: "https://github.com/klassijs/klassi-js", rules } },
      properties: { alignment: report.assurance.alignment, statement: report.assurance.statement },
      results
    }]
  };
  return `${JSON.stringify(document, null, 2).replace(/</g, "\\u003c")}
`;
}
function renderCucumberJson(report) {
  const feature = {
    keyword: "Feature",
    name: report.suite.name,
    description: `Quality gate ${report.status}`,
    uri: `${report.suite.id}.feature`,
    id: report.suite.id,
    tags: [],
    elements: report.cases.map((item) => ({
      keyword: "Scenario",
      name: item.name,
      id: item.id,
      type: "scenario",
      tags: [],
      steps: item.samples.map((sample) => ({
        keyword: "When ",
        name: sample.output,
        result: {
          status: cucumberStatus(sample.status),
          duration: sample.latencyMs * 1e6,
          ...sample.status === "fail" || sample.status === "error" ? { error_message: sample.evaluators.map((evaluator) => evaluator.reason).filter(Boolean).join("\n") } : {}
        }
      }))
    }))
  };
  return `${JSON.stringify([feature], null, 2)}
`;
}
function renderJUnit(report) {
  const failures = report.cases.filter((item) => item.status === "fail").length;
  const errors = report.cases.filter((item) => item.status === "error").length;
  const skipped = report.cases.filter((item) => item.status === "review").length;
  const time = report.cases.reduce((sum, item) => sum + item.samples.reduce((sampleSum, sample) => sampleSum + sample.latencyMs, 0), 0) / 1e3;
  const cases = report.cases.map((item) => {
    const seconds = item.samples.reduce((sum, sample) => sum + sample.latencyMs, 0) / 1e3;
    const open = `<testcase classname="${escapeXml(report.suite.id)}" name="${escapeXml(item.name)}" time="${seconds.toFixed(3)}">`;
    if (item.status === "fail") {
      return `${open}<failure message="${escapeXml(item.status)}">${escapeXml(failureText(item))}</failure></testcase>`;
    }
    if (item.status === "error") {
      return `${open}<error message="${escapeXml(item.status)}">${escapeXml(failureText(item))}</error></testcase>`;
    }
    if (item.status === "review") {
      return `${open}<skipped message="review"></skipped></testcase>`;
    }
    return `${open}</testcase>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="${escapeXml(report.suite.name)}" tests="${report.cases.length}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time.toFixed(3)}">
${cases.join("\n")}
</testsuite>
`;
}
async function writeRunReports(report, outputDir, formats = ["json", "markdown", "html", "cucumber-json", "junit", "sarif"]) {
  await (0, import_promises4.mkdir)(outputDir, { recursive: true });
  const files = [
    ["json", "report.json", `${JSON.stringify(report, null, 2)}
`],
    ["markdown", "report.md", renderMarkdown(report)],
    ["html", "report.html", renderHtml(report)],
    ["cucumber-json", "cucumber.json", renderCucumberJson(report)],
    ["junit", "junit.xml", renderJUnit(report)],
    ["sarif", "report.sarif", renderSarif(report)]
  ];
  const selected = new Set(formats);
  const artifacts = [];
  for (const [format, name, body] of files.filter(([format2]) => selected.has(format2))) {
    const filePath = import_node_path5.default.join(outputDir, name);
    await (0, import_promises4.writeFile)(filePath, body, "utf8");
    artifacts.push({ format, path: filePath });
  }
  return artifacts;
}
function assuranceControls(samples) {
  return samples.flatMap((sample) => sample.evaluatorResults.flatMap((result) => {
    const controls = result.metadata?.controls;
    if (!Array.isArray(controls)) {
      return [];
    }
    return controls.flatMap((control) => {
      if (!control || typeof control !== "object") {
        return [];
      }
      const reference = control;
      if (reference.framework !== "nist-ai-rmf" && reference.framework !== "nist-genai-profile" && reference.framework !== "owasp-genai" || typeof reference.id !== "string" || typeof reference.name !== "string") {
        return [];
      }
      return [{ evaluatorId: result.evaluatorId, status: result.status, framework: reference.framework, id: reference.id, name: reference.name }];
    });
  }));
}
function formatTokens(value) {
  return value === void 0 ? "unavailable" : String(value);
}
function formatRate(value) {
  return value === void 0 ? "unavailable" : `${Math.round(value * 100)}%`;
}
function formatNumber(value) {
  return value === void 0 ? "unavailable" : String(value);
}
function cucumberStatus(status) {
  if (status === "pass") {
    return "passed";
  }
  if (status === "review") {
    return "pending";
  }
  return "failed";
}
function failureText(item) {
  return item.samples.flatMap((sample) => sample.evaluators.map((evaluator) => evaluator.reason).filter((reason) => Boolean(reason))).join("\n");
}
function escapeHtml(value) {
  return escapeUntrusted(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeXml(value) {
  return escapeHtml(value);
}

// packages/ai-cli/dist/exit-codes.js
var EXIT_CODES = {
  passed: 0,
  qualityGateFailed: 1,
  configurationError: 2,
  executionFailure: 3,
  evaluatorFailure: 4,
  reportingFailure: 5,
  internalError: 6
};

// packages/ai-cli/dist/evaluate.js
async function runAiEvaluation(options) {
  const reporters = options.reporters ?? ["json"];
  if (typeof options.suite === "string") {
    return evaluateSuite({ ...options, suite: options.suite, reporters });
  }
  try {
    const suite = parseEvaluationSuite(options.suite);
    return await evaluatePrepared(selectCases(suite, { ...options, suite: suite.id, reporters }), hashDataset(suite), { ...options, suite: suite.id, reporters });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return { code: classifyError(error) };
  }
}
async function evaluateSuite(options) {
  try {
    const loaded = await loadSuiteFile(resolveSuitePath(options.suite, options.cwd ?? process.cwd()));
    return await evaluatePrepared(selectCases(loaded.suite, options), loaded.datasetHash, options);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return { code: classifyError(error) };
  }
}
async function evaluatePrepared(suite, datasetHash, options) {
  try {
    const registry = options.registry ?? createAdapterRegistry();
    if (!options.registry) {
      registerPlatform(registry, suite, options);
    }
    const evaluators = registerModelEvaluators(registerSecurityEvaluators(registerDeterministicEvaluators()));
    const collected = createTelemetryCollector();
    const telemetry = options.telemetry ? { emit(event) {
      collected.sink.emit(event);
      options.telemetry?.emit(event);
    } } : collected.sink;
    const execution = await runEvaluation({
      registry,
      suite,
      telemetry,
      cli: {
        ...options.samples === void 0 ? {} : { samples: options.samples },
        ...options.concurrency === void 0 ? {} : { concurrency: options.concurrency },
        ...options.failFast === void 0 ? {} : { failFast: options.failFast }
      }
    });
    const root = options.output ?? options.cwd ?? process.cwd();
    const outputDir = evidenceRunDirectory(root, execution.run.runId);
    const store = new FileEvidenceStore(root);
    const redaction = { secrets: configuredSecrets(options.env) };
    const samples = redactEvidence(await scoreSamples(execution.samples.map((record) => record.sample), suite, execution.run, evaluators, registry, store, telemetry, redaction), redaction);
    await store.save({
      secrets: redaction.secrets,
      run: { runId: execution.run.runId, suiteId: suite.id, startedAt: execution.run.startedAt },
      suite: { suiteId: suite.id, name: suite.name, version: suite.version },
      cases: suite.cases.map((item) => ({ caseId: item.id, name: item.name, targetAdapter: item.target.adapter })),
      samples: samples.map((sample) => ({
        sampleId: sample.sampleId,
        caseId: sample.caseId,
        request: { messages: suite.cases.find((item) => item.id === sample.caseId)?.input.messages ?? [] },
        response: { text: sample.execution.output.text ?? "" },
        execution: {
          status: sample.execution.status,
          latencyMs: sample.execution.timing.latencyMs,
          finishReason: sample.execution.finishReason,
          model: sample.execution.model,
          usage: sample.execution.usage,
          output: sample.execution.output
        },
        evaluators: sample.evaluatorResults.map((result) => ({ evaluatorId: result.evaluatorId, result }))
      }))
    });
    const gate = await evaluateQualityGate({
      gate: suite.qualityGate,
      samples,
      ...suite.costTable ? { costTable: suite.costTable } : {},
      cases: suite.cases.map((item) => ({ id: item.id, ...item.tags ? { tags: item.tags } : {} })),
      evidence: store.writer(execution.run.runId, { sampleId: "run", caseId: "suite" }, redaction)
    });
    const report = createRunReport({
      run: { runId: execution.run.runId, startedAt: execution.run.startedAt },
      suite,
      samples,
      gate: gate.decision,
      ...suite.costTable ? { costTable: suite.costTable } : {}
    });
    emitTelemetry(telemetry, { name: "gate.completed", runId: execution.run.runId, suiteId: suite.id, status: gate.decision.status });
    await writeRunReports(report, outputDir, options.reporters);
    await (0, import_promises5.writeFile)(import_node_path6.default.join(outputDir, "telemetry.jsonl"), `${collected.events.map((event) => JSON.stringify(event)).join("\n")}
`, "utf8");
    const code = classifyExit(samples, gate.decision.status);
    const passed = report.cases.filter((item) => item.status === "pass").length;
    const failed = report.cases.filter((item) => item.status === "fail").length;
    console.log(`${report.suite.name}: ${report.status}`);
    console.log(`cases: ${passed} passed, ${failed} failed`);
    console.log(`quality gate: ${gate.decision.status}`);
    console.log(`report: ${import_node_path6.default.join(outputDir, "report.json")}`);
    console.log(`exit: ${code}`);
    return { code, outputDir, runId: execution.run.runId, datasetHash, suite, samples };
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return { code: classifyError(error) };
  }
}
function registerPlatform(registry, suite, options) {
  const platform = options.platform ?? "fake";
  if (platform === "fake") {
    const adapter = new FakeAIAdapter();
    const scriptedText = typeof suite.metadata?.fakeResponse === "string" ? suite.metadata.fakeResponse : "hello";
    const scriptedTurns = Array.isArray(suite.metadata?.fakeResponses) ? suite.metadata.fakeResponses.filter((item) => typeof item === "string") : [scriptedText];
    for (const item of suite.cases) {
      const sampleCount = options.samples ?? item.execution?.samples ?? 1;
      const turnCount = item.conversation?.turns.length ?? 1;
      const caseText = typeof item.metadata?.fakeResponse === "string" ? item.metadata.fakeResponse : void 0;
      const toolNames2 = Array.isArray(item.metadata?.fakeToolCalls) ? item.metadata.fakeToolCalls.filter((name) => typeof name === "string") : [];
      for (let remaining = sampleCount; remaining > 0; remaining -= 1) {
        for (let turnIndex = 0; turnIndex < turnCount; turnIndex += 1) {
          const text = caseText ?? scriptedTurns[turnIndex] ?? scriptedTurns[scriptedTurns.length - 1] ?? scriptedText;
          adapter.useScript({
            kind: "success",
            text,
            ...toolNames2.length === 0 ? {} : { toolCalls: toolNames2.map((name, index) => ({ id: `call-${index + 1}`, name, status: "requested" })) }
          });
        }
      }
    }
    registry.register(adapter);
    return;
  }
  if (platform === "azure-openai") {
    const issues = azureConfigurationIssues(options.env ?? process.env);
    if (issues.length > 0) {
      throw new AIEvaluationError("CONFIG_ERROR", issues.join("\n"));
    }
    registry.register(new AzureOpenAIAdapter({ profile: defaultAzureProfile, env: options.env, fetch: options.fetch }));
    if (suite.cases.some((item) => item.evaluators.some((evaluator) => evaluator.type === "model"))) {
      const judgeIssues = azureConfigurationIssues(options.env ?? process.env, judgeAzureProfile);
      if (judgeIssues.length > 0) {
        throw new AIEvaluationError("CONFIG_ERROR", judgeIssues.join("\n"));
      }
      registry.register(new AzureOpenAIAdapter({
        id: AZURE_JUDGE_ADAPTER_ID,
        profile: judgeAzureProfile,
        env: options.env,
        fetch: options.fetch
      }));
    }
    return;
  }
  throw new AIEvaluationError("CONFIG_ERROR", `Unknown AI platform "${platform}". Supported platforms: fake, azure-openai`);
}
function resolveSuitePath(suite, cwd) {
  if ((0, import_node_fs3.existsSync)(suite)) {
    return suite;
  }
  const named = import_node_path6.default.resolve(cwd, suite);
  if ((0, import_node_fs3.existsSync)(named)) {
    return named;
  }
  const candidates = ["json", "yaml", "yml"].map((extension) => import_node_path6.default.resolve(cwd, "examples/ai", `${suite}.${extension}`));
  const found = candidates.find((candidate) => (0, import_node_fs3.existsSync)(candidate));
  if (!found) {
    throw new AIEvaluationError("DATASET_ERROR", `Suite "${suite}" was not found`);
  }
  return found;
}
function selectCases(suite, options) {
  const tag = options.tag?.replace(/^@/, "");
  const cases = suite.cases.filter((item) => {
    const caseMatch = options.caseId === void 0 || item.id === options.caseId;
    const tagMatch = tag === void 0 || item.tags?.includes(tag) === true;
    return caseMatch && tagMatch;
  });
  if (cases.length === 0) {
    throw new AIEvaluationError("DATASET_ERROR", "No evaluation cases matched --case/--tag");
  }
  return { ...suite, cases };
}
var SECRET_ENV_NAMES = ["AZURE_OPENAI_API_KEY"];
function configuredSecrets(env) {
  const source = env ?? process.env;
  return [...new Set(SECRET_ENV_NAMES.map((name) => source[name]).filter((value) => typeof value === "string" && value.length >= 8))];
}
async function scoreSamples(samples, suite, run, evaluators, adapters, store, telemetry, redaction) {
  const scored2 = [];
  for (const sample of samples) {
    const evaluationCase = suite.cases.find((item) => item.id === sample.caseId);
    if (!evaluationCase) {
      scored2.push(sample);
      continue;
    }
    const evaluatorResults = [];
    for (const turn of sample.turns ?? []) {
      const turnSpec = evaluationCase.conversation?.turns.find((item) => item.id === turn.turnId);
      const turnResults = [];
      for (const binding of turnSpec?.evaluators ?? []) {
        const scoredTurn = await scoreBinding(binding, evaluationCase, { ...sample, execution: turn.execution }, run, evaluators, adapters, store, redaction);
        turnResults.push(scoredTurn);
        emitTelemetry(telemetry, { name: "evaluator.completed", runId: run.runId, suiteId: run.suiteId, caseId: sample.caseId, sampleId: sample.sampleId, evaluatorId: scoredTurn.evaluatorId, status: scoredTurn.status });
      }
      turn.evaluatorResults = turnResults;
      evaluatorResults.push(...turnResults);
      await store.writer(run.runId, { sampleId: sample.sampleId, caseId: sample.caseId }, redaction).write({
        name: `turn-${turn.turnId}`,
        body: {
          turnId: turn.turnId,
          index: turn.index,
          messages: turn.messages,
          response: turn.execution.output.text ?? "",
          status: turn.execution.status,
          evaluatorResults: turnResults
        }
      });
    }
    for (const binding of evaluationCase.evaluators) {
      const scored3 = await scoreBinding(binding, evaluationCase, sample, run, evaluators, adapters, store, redaction);
      evaluatorResults.push(scored3);
      emitTelemetry(telemetry, { name: "evaluator.completed", runId: run.runId, suiteId: run.suiteId, caseId: sample.caseId, sampleId: sample.sampleId, evaluatorId: scored3.evaluatorId, status: scored3.status });
    }
    const statuses = evaluatorResults.map((result) => result.status).filter(isAggregateStatus3);
    scored2.push({
      ...sample,
      evaluatorResults,
      status: statuses.length === 0 ? sample.status : aggregateStatus(statuses)
    });
  }
  return scored2;
}
async function scoreBinding(binding, evaluationCase, sample, run, evaluators, adapters, store, redaction) {
  const evaluator = evaluators.resolve(binding);
  return evaluator.evaluate({
    run,
    evaluationCase,
    sample,
    result: sample.execution,
    config: binding.config ?? {},
    adapters,
    evidence: store.writer(run.runId, { sampleId: sample.sampleId, caseId: sample.caseId }, redaction)
  });
}
function classifyExit(samples, gateStatus) {
  if (samples.some((sample) => sample.execution.status !== "completed" && sample.execution.status !== "blocked")) {
    return EXIT_CODES.executionFailure;
  }
  if (samples.some((sample) => sample.evaluatorResults.some((result) => result.status === "error"))) {
    return EXIT_CODES.evaluatorFailure;
  }
  return gateStatus === "pass" ? EXIT_CODES.passed : EXIT_CODES.qualityGateFailed;
}
function classifyError(error) {
  if (error instanceof DatasetValidationError) {
    return EXIT_CODES.configurationError;
  }
  if (error instanceof AIEvaluationError) {
    if (error.code === "DATASET_ERROR" || error.code === "CONFIG_ERROR") {
      return EXIT_CODES.configurationError;
    }
    if (error.code === "EVALUATOR_ERROR") {
      return EXIT_CODES.evaluatorFailure;
    }
    if (error.code === "EVIDENCE_ERROR" || error.code === "REPORTER_ERROR") {
      return EXIT_CODES.reportingFailure;
    }
    if (error.code === "PROVIDER_UNAVAILABLE" || error.code === "ADAPTER_NOT_FOUND" || error.code === "TIMEOUT_ERROR") {
      return EXIT_CODES.executionFailure;
    }
  }
  return EXIT_CODES.internalError;
}
function isAggregateStatus3(status) {
  return status === "pass" || status === "fail" || status === "error" || status === "review";
}

// packages/ai-cli/dist/cli.js
var REPORT_FORMATS = {
  json: "json",
  markdown: "markdown",
  html: "html",
  cucumber: "cucumber-json",
  junit: "junit",
  sarif: "sarif"
};
async function execute(argv) {
  let code = EXIT_CODES.configurationError;
  const program2 = new Command();
  program2.exitOverride().name("klassi");
  addRunOptions(program2.command("ai:evaluate").description("Run an AI evaluation suite")).option("--reporter <list>", "json, markdown, html, cucumber, junit, sarif", "json,markdown,html,cucumber,junit,sarif").option("--output <dir>", "directory that receives the run evidence and reports").action(async (options) => {
    const outcome = await evaluateSuite(runOptions(options, parseReporters(options.reporter)));
    code = outcome.code;
  });
  addRunOptions(program2.command("ai:baseline").description("Run a suite and save the result as a baseline")).requiredOption("--output <file>", "baseline JSON file").option("--name <name>", "baseline name").action(async (options) => {
    code = await writeBaseline(options);
  });
  addRunOptions(program2.command("ai:compare").description("Run a suite and compare it with a baseline")).requiredOption("--baseline <file>", "baseline JSON file").option("--output <dir>", "directory that receives the run evidence and reports").option("--score-delta <number>", "absolute score change that counts as material", parseDelta).option("--pass-rate-delta <number>", "absolute pass-rate change that counts as material", parseDelta).option("--latency-delta <number>", "absolute P95 latency change, in milliseconds, that counts as material", parseDelta).action(async (options) => {
    code = await compareRun(options);
  });
  program2.command("ai:doctor").description("Check AI platform configuration and connectivity").requiredOption("--platform <id>", "platform adapter id").action(async (options) => {
    code = await runAzureDoctor({ platform: options.platform });
  });
  program2.command("ai:import").description("Import a verified Test Genie bundle into features, steps, and page objects").option("--file <path>", "bundle JSON file").option("--dir <path>", "folder that contains bundle.json").option("--from <source>", "pull a stored bundle from Test Genie SaaS").option("--generation <id>", "Test Genie generation id").option("--out <dir>", "project directory that receives the Cucumber files", ".").option("--bind-locators", "open the product URL and bind locators from the live page").action(async (options) => {
    code = await importBundle(options);
  });
  try {
    await program2.parseAsync(argv);
  } catch (error) {
    if (error instanceof CommanderError) {
      return EXIT_CODES.configurationError;
    }
    console.error(error instanceof Error ? error.message : String(error));
    return EXIT_CODES.internalError;
  }
  return code;
}
function addRunOptions(command) {
  return command.requiredOption("--suite <name>", "suite name or path").option("--case <id>", "run one case id").option("--tag <tag>", "run cases with this tag").option("--samples <count>", "override the sample count", parsePositiveInteger).option("--concurrency <count>", "override the sample concurrency", parsePositiveInteger).option("--fail-fast", "stop later cases after an infrastructure error", false).option("--platform <id>", "fake or azure-openai", "fake");
}
function runOptions(options, reporters) {
  return {
    suite: options.suite,
    caseId: options.case,
    tag: options.tag,
    samples: options.samples,
    concurrency: options.concurrency,
    reporters,
    output: options.output,
    failFast: options.failFast,
    platform: options.platform
  };
}
async function writeBaseline(options) {
  const directory = import_node_path7.default.dirname(options.output);
  const outcome = await evaluateSuite({ ...runOptions(options, ["json"]), output: directory });
  if (!outcome.suite || !outcome.samples || !outcome.runId || !outcome.datasetHash || outcome.code > EXIT_CODES.qualityGateFailed) {
    return outcome.code;
  }
  const baseline = createBaseline({
    id: `baseline-${outcome.runId}`,
    name: options.name ?? outcome.suite.name,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    suiteId: outcome.suite.id,
    suiteVersion: outcome.suite.version,
    datasetHash: outcome.datasetHash,
    sourceRunId: outcome.runId,
    samples: outcome.samples
  });
  await (0, import_promises6.mkdir)(directory, { recursive: true });
  await (0, import_promises6.writeFile)(options.output, `${JSON.stringify(baseline, null, 2)}
`, "utf8");
  console.log(`baseline: ${options.output}`);
  console.log(`source run: ${baseline.sourceRunId}`);
  return EXIT_CODES.passed;
}
async function compareRun(options) {
  let saved;
  try {
    saved = parseBaseline(JSON.parse(await (0, import_promises6.readFile)(options.baseline, "utf8")));
  } catch (error) {
    console.error(error instanceof DatasetValidationError || error instanceof Error ? error.message : String(error));
    return EXIT_CODES.configurationError;
  }
  const outcome = await evaluateSuite({ ...runOptions(options, ["json"]), output: options.output });
  if (!outcome.suite || !outcome.samples || !outcome.runId || !outcome.datasetHash || outcome.code > EXIT_CODES.qualityGateFailed) {
    return outcome.code;
  }
  const current = createBaseline({
    id: `current-${outcome.runId}`,
    name: outcome.suite.name,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    suiteId: outcome.suite.id,
    suiteVersion: outcome.suite.version,
    datasetHash: outcome.datasetHash,
    sourceRunId: outcome.runId,
    samples: outcome.samples
  });
  const thresholds = {
    scoreDelta: options.scoreDelta ?? 0.05,
    passRateDelta: options.passRateDelta ?? 0.05,
    latencyMsDelta: options.latencyDelta ?? 0
  };
  const comparison = compareBaselines(saved, current, thresholds);
  console.log(`comparison: ${comparison.verdict}`);
  console.log(comparison.reason);
  for (const item of comparison.cases) {
    console.log(`${item.caseId}: ${item.verdict}`);
  }
  if (comparison.verdict === "regression") {
    return EXIT_CODES.qualityGateFailed;
  }
  if (comparison.verdict === "not comparable") {
    return EXIT_CODES.configurationError;
  }
  return EXIT_CODES.passed;
}
async function importBundle(options) {
  let payload;
  try {
    if (options.from === "test-genie") {
      payload = await fetchBundle(options.generation ?? "");
    } else {
      const location = options.file ?? options.dir ?? process.env.KLASSI_WDRIVE ?? "";
      if (!location.trim()) {
        throw new Error("KLASSI_WDRIVE is not set. Pass --dir or --file, or set KLASSI_WDRIVE.");
      }
      payload = await readBundle(location);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return EXIT_CODES.configurationError;
  }
  let result;
  try {
    result = await importTestGenieBundle(payload, options.out, {
      bindLocators: Boolean(options.bindLocators || process.env.PRODUCT_BASE_URL)
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return EXIT_CODES.configurationError;
  }
  console.log(`Test Genie ${result.generationId}: ${result.outcome}`);
  for (const finding of result.findings) {
    console.log(finding);
  }
  for (const item of result.imported) {
    console.log(`${item.id}: ${item.feature}`);
  }
  for (const id of result.skipped) {
    console.log(`${id}: already exists, not overwritten`);
  }
  return result.outcome === "VERIFIED" ? EXIT_CODES.passed : EXIT_CODES.qualityGateFailed;
}
function parseDelta(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new CommanderError(EXIT_CODES.configurationError, "ai.option", `${value} must be a non-negative number`);
  }
  return parsed;
}
function parsePositiveInteger(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new CommanderError(EXIT_CODES.configurationError, "ai.option", `${value} must be a positive integer`);
  }
  return parsed;
}
function parseReporters(value) {
  const formats = value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  const resolved = formats.map((item) => REPORT_FORMATS[item]);
  if (resolved.length === 0 || resolved.some((item) => item === void 0)) {
    throw new CommanderError(EXIT_CODES.configurationError, "ai.reporter", `Unknown reporter list "${value}"`);
  }
  return resolved;
}

// packages/ai-cli/dist/public.js
var AI_PUBLIC_API_VERSION = "1.0.0";
function aiCase(input) {
  return parseEvaluationCase(input);
}
function aiSuite(input) {
  return parseEvaluationSuite(input);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AI_PUBLIC_API_VERSION,
  FakeAIAdapter,
  aiCase,
  aiSuite,
  createAdapterRegistry,
  execute,
  runAiEvaluation
});
