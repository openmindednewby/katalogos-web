/**
 * MenuFlow Embeddable Widget Loader
 *
 * Usage:
 *   <div data-menu-widget data-menu-id="YOUR_MENU_ID" data-origin="https://your-app.com"></div>
 *   <script src="https://your-app.com/widget.js"></script>
 *
 * Attributes:
 *   data-menu-widget  - Required. Marks the element as a widget container.
 *   data-menu-id      - Required. The public menu external ID.
 *   data-origin       - Required. The SaaS application origin (protocol + host).
 *   data-width        - Optional. iframe width (default: "100%").
 *   data-height       - Optional. iframe height in px (default: 600).
 *   data-theme        - Optional. "light" or "dark" theme override.
 *   data-accent-color - Optional. Hex accent color override.
 */
(function () {
  'use strict';

  var DEFAULT_WIDTH = '100%';
  var DEFAULT_HEIGHT = 600;
  var MESSAGE_TYPE = 'menu-widget-resize';

  function initWidgets() {
    var containers = document.querySelectorAll('[data-menu-widget]');
    for (var i = 0; i < containers.length; i++) {
      createWidget(containers[i]);
    }
  }

  function createWidget(container) {
    var menuId = container.getAttribute('data-menu-id');
    var origin = container.getAttribute('data-origin');
    if (!menuId || !origin) return;

    var width = container.getAttribute('data-width') || DEFAULT_WIDTH;
    var height = parseInt(container.getAttribute('data-height'), 10) || DEFAULT_HEIGHT;
    var theme = container.getAttribute('data-theme') || '';
    var accentColor = container.getAttribute('data-accent-color') || '';

    var params = ['embed=1'];
    if (theme) params.push('theme=' + encodeURIComponent(theme));
    if (accentColor) params.push('accentColor=' + encodeURIComponent(accentColor));

    var src = origin + '/public/menu/embed/' + encodeURIComponent(menuId) + '?' + params.join('&');

    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.style.width = width;
    iframe.style.height = height + 'px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', 'Embedded Menu');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

    container.appendChild(iframe);

    window.addEventListener('message', function (event) {
      if (event.origin !== origin) return;
      var data = event.data;
      if (data && data.type === MESSAGE_TYPE && typeof data.height === 'number') {
        iframe.style.height = data.height + 'px';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidgets);
  } else {
    initWidgets();
  }
})();
