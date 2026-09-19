/*	Load
  Loads External Javascript and CSS
  Adapted from LazyLoad and adjusted from earlier TimelineJS to
  not add an extra layer.  Seems like we could simplify
  this, but leaving in in case users need support for older browsers.
  ================================================== */

/*
LazyLoad makes it easy and painless to lazily load one or more external
JavaScript or CSS files on demand either during or after the rendering of a web
page.

Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
are not officially supported.

Visit https://github.com/rgrove/lazyload/ for more info.

Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
class Loader {
    declare "doc": any;
    declare "pending": any;
    declare "queue": any;
    declare "head": any;

    constructor(document) {
        this.doc = document
        this.pending = {}
        this.queue = { css: [], js: [] };
        this.head = this.doc.head || this.doc.getElementsByTagName('head')[0];

    }



    // -- Private Methods --------------------------------------------------------

    /**
    Creates and returns an HTML element with the specified name and attributes.

    @method createNode
    @param {String} name element name
    @param {Object} attrs name/value mapping of element attributes
    @return {HTMLElement}
    @private
    */
    createNode(name, attrs?) {
        let node = this.doc.createElement(name),
            attr;

        for (attr in attrs) {
            if (Object.hasOwn(attrs, attr)) {
                node.setAttribute(attr, attrs[attr]);
            }
        }

        return node;
    }

    /**
    Called when the current pending resource of the specified type has finished
    loading. Executes the associated callback (if any) and loads the next
    resource in the queue.

    @method finish
    @param {String} type resource type ('css' or 'js')
    @private
    */
    finish(type) {
        let p = this.pending[type],
            callback,
            urls;

        if (p) {
            callback = p.callback;
            urls = p.urls;

            urls.shift();

            // If this is the last of the pending URLs, execute the callback and
            // start the next request in the queue (if any).
            if (!urls.length) {
                callback && callback.call(p.context, p.obj);
                this.pending[type] = null;
                this.queue[type].length && this.load(type);
            }
        }
    }

    /**
    Loads the specified resources, or the next resource of the specified type
    in the queue if no resources are specified. If a resource of the specified
    type is already being loaded, the new request will be queued until the
    first request has been finished.

    When an array of resource URLs is specified, those URLs will be loaded in
    parallel if it is possible to do so while preserving execution order. All
    browsers support parallel loading of CSS, but only Firefox and Opera
    support parallel loading of scripts. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.

    @method load
    @param {String} type resource type ('css' or 'js')
    @param {String|Array} urls (optional) URL or array of URLs to load
    @param {Function} callback (optional) callback function to execute when the
      resource is loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function will
      be executed in this object's context
    @private
    */
    load(type, urls?, callback?, obj?, context?) {
        let _finish = function(this: any) { this.finish(type); }.bind(this),
            isCSS = type === 'css',
            nodes = [],
            i, len, node, p, pendingUrls, url;



        if (urls) {
            // If urls is a string, wrap it in an array. Otherwise assume it's an
            // array and create a copy of it so modifications won't be made to the
            // original.
            urls = typeof urls === 'string' ? [urls] : urls.concat();

            // Create a request object for each URL. If multiple URLs are specified,
            // the callback will only be executed after all URLs have been loaded.
            //
            // Load in parallel.
            this.queue[type].push({
                urls: urls,
                callback: callback,
                obj: obj,
                context: context
            });
        }

        // If a previous load request of this type is currently in progress, we'll
        // wait our turn. Otherwise, grab the next item in the queue.
        if (this.pending[type] || !(p = this.pending[type] = this.queue[type].shift())) {
            return;
        }


        pendingUrls = p.urls;

        for (i = 0, len = pendingUrls.length; i < len; ++i) {
            url = pendingUrls[i];

            if (isCSS) {
                node = this.createNode('link', {
                    href: url,
                    rel: 'stylesheet'
                });
            } else {
                node = this.createNode('script', { src: url });
                node.async = false;
            }

            node.className = 'lazyload';
            node.setAttribute('charset', 'utf-8');
            node.onload = node.onerror = _finish;

            nodes.push(node);
        }

        for (i = 0, len = nodes.length; i < len; ++i) {
            this.head.appendChild(nodes[i]);
        }
    }


    /**
    Requests the specified CSS URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified, the stylesheets will be loaded in parallel and the callback
    will be executed after all stylesheets have finished loading.

    @method css
    @param {String|Array} urls CSS URL or array of CSS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified stylesheets are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    css(urls, callback, obj, context) {
        this.load('css', urls, callback, obj, context);
    }

    /**
    Requests the specified JavaScript URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified and the browser supports it, the scripts will be loaded in
    parallel and the callback will be executed after all scripts have
    finished loading.

    Currently, only Firefox and Opera support parallel loading of scripts while
    preserving execution order. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.

    @method js
    @param {String|Array} urls JS URL or array of JS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified scripts are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    js(urls, callback, obj, context) {
        this.load('js', urls, callback, obj, context);
    }
}

function loadJS(urls, callback, obj?, context?) {
    loader.js(urls, callback, obj, context)
}

function loadCSS(urls, callback, obj?, context?) {
    loader.css(urls, callback, obj, context)
}


// this seems fragile but not sure how else to inject the document
// besides 
const loader = new Loader(document)

export { loadJS, loadCSS }
