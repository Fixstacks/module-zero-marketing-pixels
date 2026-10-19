/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Zero Marketing Pixels: Meta Pixel, TikTok Pixel, Pinterest Tag and
 * Microsoft Clarity; IDs from #zero-pixels-settings.
 * 1. Nothing loads before consent (window.zeroConsent): the ad pixels wait for
 *    marketing, Clarity for analytics. A later choice (`zero:consent`) loads
 *    them, or stops them when consent is withdrawn.
 * 2. Events are the storefront's GA4 e-commerce events from Zero Google
 *    Analytics' analytics.js: the ones so far (window.zeroAnalytics), then each
 *    `zero:analytics`, translated to each network's standard events.
 * The loaders are the vendors' own base code, without the inline script.
 */
(function () {
    'use strict';

    var settingsEl = document.getElementById('zero-pixels-settings');
    if (!settingsEl) {
        return;
    }
    var ids = JSON.parse(settingsEl.textContent);

    function addScript(src) {
        var script = document.createElement('script');
        script.async = true;
        script.src = src;
        document.head.appendChild(script);
    }

    function items(params) {
        return (params && params.items) || [];
    }

    function quantity(params) {
        return items(params).reduce(function (sum, item) { return sum + (Number(item.quantity) || 1); }, 0);
    }

    function money(params) {
        var value = Number(params && params.value);
        return isNaN(value) ? undefined : value;
    }

    /* ---------- the pixels ---------- */

    var pixels = {
        meta: {
            purpose: 'marketing',
            load: function (id) {
                var n = window.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                if (!window._fbq) {
                    window._fbq = n;
                }
                n.push = n;
                n.loaded = true;
                n.version = '2.0';
                n.queue = [];
                addScript('https://connect.facebook.net/en_US/fbevents.js');
                window.fbq('init', id);
                window.fbq('track', 'PageView');
            },
            revoke: function () {
                window.fbq('consent', 'revoke');
            },
            grant: function () {
                window.fbq('consent', 'grant');
            },
            send: function (name, params) {
                var data = {
                    content_ids: items(params).map(function (item) { return String(item.item_id); }),
                    contents: items(params).map(function (item) {
                        return { id: String(item.item_id), quantity: Number(item.quantity) || 1, item_price: Number(item.price) || undefined };
                    }),
                    content_type: 'product',
                    value: money(params),
                    currency: params.currency
                };
                var map = {
                    view_item: 'ViewContent',
                    add_to_cart: 'AddToCart',
                    add_to_wishlist: 'AddToWishlist',
                    begin_checkout: 'InitiateCheckout',
                    add_payment_info: 'AddPaymentInfo',
                    purchase: 'Purchase'
                };
                if (map[name]) {
                    if (name === 'begin_checkout') {
                        data.num_items = quantity(params);
                    }
                    var options = name === 'purchase' && params.transaction_id ? { eventID: 'purchase-' + params.transaction_id } : undefined;
                    window.fbq('track', map[name], data, options);
                } else if (name === 'search') {
                    window.fbq('track', 'Search', { search_string: params.search_term });
                } else if (name === 'sign_up') {
                    window.fbq('track', 'CompleteRegistration');
                }
            }
        },

        tiktok: {
            purpose: 'marketing',
            load: function (id) {
                var ttq = window.ttq = window.ttq || [];
                window.TiktokAnalyticsObject = 'ttq';
                ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group',
                    'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
                ttq.setAndDefer = function (target, method) {
                    target[method] = function () {
                        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
                    };
                };
                ttq.methods.forEach(function (method) { ttq.setAndDefer(ttq, method); });
                ttq.instance = function (name) {
                    var instance = ttq._i[name] || [];
                    ttq.methods.forEach(function (method) { ttq.setAndDefer(instance, method); });
                    return instance;
                };
                ttq.load = function (pixelId, options) {
                    var src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
                    ttq._i = ttq._i || {};
                    ttq._i[pixelId] = [];
                    ttq._i[pixelId]._u = src;
                    ttq._t = ttq._t || {};
                    ttq._t[pixelId] = +new Date();
                    ttq._o = ttq._o || {};
                    ttq._o[pixelId] = options || {};
                    addScript(src + '?sdkid=' + encodeURIComponent(pixelId) + '&lib=ttq');
                };
                ttq.load(id);
                ttq.page();
            },
            revoke: function () {
                window.ttq.revokeConsent();
            },
            grant: function () {
                window.ttq.grantConsent();
            },
            send: function (name, params) {
                var data = {
                    contents: items(params).map(function (item) {
                        return { content_id: String(item.item_id), content_name: item.item_name, quantity: Number(item.quantity) || 1, price: Number(item.price) || undefined };
                    }),
                    content_type: 'product',
                    value: money(params),
                    currency: params.currency
                };
                var map = {
                    view_item: 'ViewContent',
                    add_to_cart: 'AddToCart',
                    add_to_wishlist: 'AddToWishlist',
                    begin_checkout: 'InitiateCheckout',
                    add_payment_info: 'AddPaymentInfo',
                    purchase: 'CompletePayment'
                };
                if (map[name]) {
                    window.ttq.track(map[name], data, name === 'purchase' && params.transaction_id ? { event_id: 'purchase-' + params.transaction_id } : undefined);
                } else if (name === 'search') {
                    window.ttq.track('Search', { query: params.search_term });
                } else if (name === 'sign_up') {
                    window.ttq.track('CompleteRegistration');
                }
            }
        },

        pinterest: {
            purpose: 'marketing',
            load: function (id) {
                if (!window.pintrk) {
                    window.pintrk = function () {
                        window.pintrk.queue.push(Array.prototype.slice.call(arguments));
                    };
                    window.pintrk.queue = [];
                    window.pintrk.version = '3.0';
                    addScript('https://s.pinimg.com/ct/core.js');
                }
                window.pintrk('load', id);
                window.pintrk('page');
            },
            send: function (name, params) {
                var data = {
                    value: money(params),
                    currency: params.currency,
                    order_quantity: quantity(params) || undefined,
                    line_items: items(params).map(function (item) {
                        return { product_id: String(item.item_id), product_name: item.item_name, product_price: Number(item.price) || undefined, product_quantity: Number(item.quantity) || 1 };
                    })
                };
                if (name === 'view_item') {
                    window.pintrk('track', 'pagevisit', data);
                } else if (name === 'view_item_list') {
                    window.pintrk('track', 'viewcategory', { line_items: data.line_items.slice(0, 20) });
                } else if (name === 'add_to_cart') {
                    window.pintrk('track', 'addtocart', data);
                } else if (name === 'purchase') {
                    data.order_id = params.transaction_id;
                    data.event_id = params.transaction_id ? 'purchase-' + params.transaction_id : undefined;
                    window.pintrk('track', 'checkout', data);
                } else if (name === 'search') {
                    window.pintrk('track', 'search', { search_query: params.search_term });
                } else if (name === 'sign_up') {
                    window.pintrk('track', 'signup');
                }
            }
        },

        clarity: {
            purpose: 'analytics',
            load: function (id) {
                window.clarity = window.clarity || function () {
                    (window.clarity.q = window.clarity.q || []).push(arguments);
                };
                addScript('https://www.clarity.ms/tag/' + encodeURIComponent(id));
                window.clarity('consent');
            },
            revoke: function () {
                window.clarity('consent', false);
            },
            grant: function () {
                window.clarity('consent');
            },
            send: function () {
                // Clarity records the page itself: no e-commerce events.
            }
        }
    };

    /* ---------- consent and events ---------- */

    var consent = window.zeroConsent ? window.zeroConsent.get() : { analytics: false, marketing: false };
    var state = {}; // pixel => 'loaded' | 'stopped'

    function allowed(pixel) {
        return !!consent[pixels[pixel].purpose];
    }

    function deliver(pixel, event) {
        try {
            pixels[pixel].send(event.name, event.params || {});
        } catch (e) {
            // A network's script failing must not stop the others or the page.
        }
    }

    function update() {
        Object.keys(ids).forEach(function (pixel) {
            if (!pixels[pixel]) {
                return;
            }
            if (allowed(pixel)) {
                if (!state[pixel]) {
                    pixels[pixel].load(ids[pixel]);
                    (window.zeroAnalytics || []).forEach(function (event) { deliver(pixel, event); });
                } else if (state[pixel] === 'stopped' && pixels[pixel].grant) {
                    pixels[pixel].grant();
                }
                state[pixel] = 'loaded';
            } else if (state[pixel] === 'loaded') {
                if (pixels[pixel].revoke) {
                    pixels[pixel].revoke();
                }
                state[pixel] = 'stopped';
            }
        });
    }

    document.addEventListener('zero:analytics', function (event) {
        Object.keys(state).forEach(function (pixel) {
            if (state[pixel] === 'loaded') {
                deliver(pixel, event.detail);
            }
        });
    });

    document.addEventListener('zero:consent', function (event) {
        consent = event.detail;
        update();
    });

    update();
})();
