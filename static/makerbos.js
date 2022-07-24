var MakerobosWidget = (function () {
    function MakerobosWidget() {
      var o = this;
      (this.webDomLoaded = !0),
        (this.environment = {
          dev: {
            api: "https://dev.backend.makerobos.com",
            widget: "https://dev.widget.makerobos.com",
            btn: "https://s3.ap-south-1.amazonaws.com/makerobosfastcdn/cdn/bot-btn-dev.html",
            css: "https://s3.ap-south-1.amazonaws.com/makerobosfastcdn/cdn/makerobos-dev.css",
            glass:
              "https://s3.ap-south-1.amazonaws.com/makerobosfastcdn/cdn/glass-messages-dev.html",
            socket: "wss://liveapp.makerobos.com",
            bypass_check: !1,
          },
        }),
        (this.env = "dev"),
        (this.version = "0.0.1"),
        (this.widgetDomLoaded = !1),
        (this.widgetLoaded = !1),
        (this.widget_user_device = "desktop"),
        (this.apiRequestType = { post: "POST", get: "GET" }),
        (this.widget = {}),
        (this.glassMessageState = "hidden"),
        (this.pendingMessages = []),
        (this.widget_wakeup_once = !1),
        (this.bypass_hostname_check = !1),
        (this.bot_load_time = new Date()),
        (this.avatar_hidden = !0),
        (this.scroll_percent = null),
        (this.auto_wakeup_type = null),
        (this.status = "pending"),
        (this.tab_active = !0),
        (this.verifiedWingman = !1),
        (this.userLocation = {}),
        (this.recursive_count = 0),
        (this._waitLocationCount = 0),
        (this.toggleTitleFunction = function (e) {
          var t = document.getElementsByTagName("title")[0];
          e || "(1) New Message" == t.innerHTML
            ? (t.innerHTML = o.title)
            : (t.innerHTML = "(1) New Message");
        }),
        (this.livechat_message_counter = 0),
        (this.livechat_agent = {}),
        (this.pageScrollEvent = function (e) {
          ((e.srcElement.scrollingElement.clientHeight +
            e.srcElement.scrollingElement.scrollTop) /
            e.srcElement.scrollingElement.scrollHeight) *
            100 >=
            o.scroll_percent &&
            (e = document.getElementById("mkosBTNContainer")) &&
            ((e.style.visibility = "visible"),
            e.classList.add("mkosBTNContainer"),
            "glass" == o.auto_wakeup_type &&
              (o.autoWakeupGlass(), o.unsubscribeScroll()),
            "widget" == o.auto_wakeup_type &&
              (o.autoWakeupWidget(), o.unsubscribeScroll()));
        }),
        (this.recursiveBlockRunCounter = 0),
        (this.recBlockCheckCounter = 0),
        (this.toggleBtn = function (e) {
          try {
            document
              .getElementById("mkosBTNFrame")
              .contentWindow.postMessage(e, "*");
          } catch (e) {}
        }),
        (this.nav_history = { pages: [], landing: {} }),
        (this.prev_page = window.location.href),
        (this.windowResized = function (e) {
          o.sendMessage({ type: "window_resize" });
        }),
        (this.ws_status = "pending"),
        (this.reconnect_websocket_count = 0),
        (this.agent_messages = []),
        (this.scripts = { socket: !1, rtc: !1, status: !1 }),
        (this.tracks = []);
      var e = document.getElementById("makerobos_v1");
      (this.site_token =
        e.getAttribute("token") || e.getAttribute("data-token")),
        e.hasAttribute("data-bypass-hostname-check") &&
          (this.bypass_hostname_check = !0),
        this.loadStyles(),
        this.urlListeners(),
        this.startupScripts(),
        this.urlChangeEvent(null),
        this.trackSessionHistory(!0),
        this.loadAudioFiles(),
        setInterval(function () {
          o.trackTimeSpentOnPage();
        }, 5e3);
      var t = localStorage.getItem("mkos_location");
      t ? (this.userLocation = JSON.parse(t)) : this.getUserLocation(),
        (this.avatar_hidden =
          e.hasAttribute("hidden") || e.hasAttribute("data-hidden")),
        e.hasAttribute("data-scroll-percent") &&
          ((this.scroll_percent = Number(
            e.getAttribute("data-scroll-percent")
          )),
          window.addEventListener("scroll", this.pageScrollEvent));
    }
    return (
      (MakerobosWidget.prototype.checkVersion = function () {
        var e,
          t = this;
        ("prod" != this.env && "dev" != this.env) ||
        this.environment[this.env].bypass_check
          ? this.loadStyles()
          : ((e = Math.round(100 * Math.random())),
            this.apiRequest(
              "GET",
              this.environment[this.env].widget +
                "/version.json?v=" +
                e.toString()
            ).then(
              function (e) {
                e = JSON.parse(e);
                (t.version = e.version), t.loadStyles();
              },
              function (e) {
                t.reportError(
                  "Widget load error",
                  "Environment: " +
                    t.env +
                    " | Error in loading version of widget. widget will not run.",
                  "WIDGET_VERSION_ERROR"
                );
              }
            ));
      }),
      (MakerobosWidget.prototype.getUserLocation = function (t) {
        var o = this;
        this.apiRequest(
          "GET",
          "https://us-central1-placesapi-1548411278228.cloudfunctions.net/function-1"
        ).then(
          function (e) {
            (o.userLocation = JSON.parse(e)),
              localStorage.setItem(
                "mkos_location",
                JSON.stringify(o.userLocation)
              );
            try {
              o.updateVisitorInfo();
            } catch (e) {}
          },
          function (e) {
            t
              ? t < 3 &&
                setTimeout(function () {
                  o.getUserLocation(t + 1);
                })
              : setTimeout(function () {
                  o.getUserLocation(1);
                }, 50),
              o.reportError(
                "Location Error",
                "Environment: " +
                  o.env +
                  " | Google location API not returend response in widget.js script.",
                "WIDGET_LOCATION_ERROR"
              ),
              (o.userLocation = { error: "error in function" });
          }
        );
      }),
      (MakerobosWidget.prototype.verifyDomain = function () {
        var t = this,
          e = "/api/domain-auth/?d_id=";
        this.bypass_hostname_check && (e = "/api/domain-bot/?d_id="),
          this.apiRequest(
            this.apiRequestType.get,
            this.environment[this.env].api + e + this.site_token
          ).then(function (e) {
            e = JSON.parse(e);
            (t.bot_token = e.bot.bot_id), t.fetchWidget();
          });
      }),
      (MakerobosWidget.prototype.reportError = function (e, t, o) {
        "prod" == this.env && (this.widget.bot, window.location.href);
      }),
      (MakerobosWidget.prototype.loadStyles = function () {
        var e = document.getElementsByTagName("head")[0],
          t = document.createElement("link");
        t.setAttribute("rel", "stylesheet"),
          ("dev" != this.env && "prod" != this.env) ||
          this.environment[this.env].bypass_check
            ? ((this.bot_token = this.site_token), this.fetchWidget())
            : this.verifyDomain(),
          t.setAttribute(
            "href",
            this.environment[this.env].css + "?version=" + this.version
          ),
          e.appendChild(t);
      }),
      (MakerobosWidget.prototype.fetchWidget = function () {
        var o = this;
        this.widgetDomLoaded ||
          this.apiRequest(
            this.apiRequestType.get,
            this.environment[this.env].api +
              "/api/widget/" +
              this.bot_token +
              "/"
          )
            .then(function (e) {
              var t = JSON.parse(e);
              t.user_device && (o.widget_user_device = t.user_device),
                (t.host = window.location.host),
                (t.source = "widget"),
                (o.widget = t);
              e = new URL(window.location.href);
              o.parseGreeting(o.widget.greeting, {
                first_name: e.searchParams.get("first_name"),
                last_name: e.searchParams.get("last_name"),
              }).then(function (e) {
                (o.widget.greeting_new = e),
                  ((0 == t.hibernate && "all" == t.display_on) ||
                    t.display_on == t.user_device) &&
                    o
                      .checkWidgetHideRules(o.widget)
                      .then(
                        function (e) {
                          (o.widgetDomLoaded = !0),
                            sessionStorage.getItem("widget_destroyed")
                              ? (o.status = "destroyed")
                              : o.createVisitor();
                        },
                        function (e) {}
                      )
                      .catch(function (e) {});
              });
            })
            .catch(function (e) {
              o.reportError(
                "Widget data load error",
                "Environment: " +
                  o.env +
                  " | Widget data API returned error in widget.js, widget will not load",
                "WIDGET_DATA_LOAD_ERROR"
              );
            });
      }),
      (MakerobosWidget.prototype.createVisitor = function () {
        var t = this,
          e = localStorage.getItem("mkos_visitor"),
          o = {},
          i = !0;
        if (e) {
          o = JSON.parse(e);
          try {
            (new Date().getTime() -
              new Date(o.timestamp).setHours(0, 0, 0, 0)) /
              1e3 <
              86400 && ((i = !1), (this.widget.visitor_id = o.visitor_id));
          } catch (e) {}
        }
        i
          ? this.apiRequest(
              this.apiRequestType.post,
              this.environment[this.env].api + "/api/visitor/",
              JSON.stringify({
                bot: this.widget.bot,
                visitor_id: o.visitor_id,
                source: this.widget.source,
              })
            ).then(
              function (e) {
                e = JSON.parse(e);
                localStorage.setItem(
                  "mkos_visitor",
                  JSON.stringify({
                    visitor_id: e.visitor_id,
                    timestamp: new Date().toISOString(),
                  })
                ),
                  (t.widget.visitor_id = e.visitor_id),
                  t.loadDOM();
              },
              function (e) {
                t.loadDOM();
              }
            )
          : this.loadDOM();
      }),
      (MakerobosWidget.prototype.loadDOM = function () {
        var i = this,
          s = document.getElementsByTagName("body")[0],
          o = "right" == this.widget.position ? "_widgetRight" : "_widgetLeft";
        this.widget.position;
        this.generateGlassMessageDOM(s),
          this.createSetAttributeValue("div", [
            ["id", "makerobos_container"],
            [
              "class",
              "makerobos_containerMain " + o + " " + this.widget.avatar_size,
            ],
            [
              "style",
              "position: fixed; width: 0px; height: 0px; bottom: 0px; z-index: -99; pointer-events:none",
            ],
          ]).then(function (o) {
            i.createSetAttributeValue("div", [
              ["class", "makerobos_containerIn mkosFadeOut"],
              [
                "style",
                "transform: translateX(" +
                  ("right" == i.widget.position ? 10 : -10) +
                  "px); opacity:0; pointer-events:none;",
              ],
              ["id", "makerobos_cont"],
            ]).then(function (t) {
              window.innerWidth < 600 &&
                (t.style.width = window.innerWidth + "px"),
                i
                  .createSetAttributeValue("iframe", [
                    ["id", "makerobos_chat"],
                    ["title", "Makerobos Widget Iframe"],
                    ["class", "makerobos_ContaineraIframe"],
                    ["allow", "camera *; microphone *"],
                    ["src", i.environment[i.env].widget + "?ver=" + i.version],
                  ])
                  .then(function (e) {
                    t.appendChild(e),
                      o.appendChild(t),
                      s.appendChild(o),
                      (i.status = "installed");
                  });
            });
          }),
          this.createSetAttributeValue("div", [
            ["id", "mkosBTNContainer"],
            ["class", o],
            [
              "style",
              "position: fixed; width: 0px; height: 0px; bottom: 0px; z-index: 2147482999; visibility:hidden",
            ],
          ]).then(function (t) {
            var e = i.widget.rippel_effect ? "_rippleEffect" : "";
            i
              .createSetAttributeValue("iframe", [
                ["id", "mkosBTNFrame"],
                ["title", "Makerobos Widget Launcher Button"],
                ["class", "mkosBTNFrame " + i.widget.avatar_size + " " + o],
                [
                  "src",
                  i.environment[i.env].btn +
                    "?img=" +
                    i.widget.avatar +
                    "&avatar_name=" +
                    i.widget.avatar_name +
                    "&ripple=" +
                    e +
                    "&position=" +
                    o +
                    "&color=" +
                    i.widget.interaction_color.substr(1) +
                    "&launcher_size=" +
                    i.widget.avatar_size +
                    "&launcher_shape=" +
                    i.widget.button_shape,
                ],
              ])
              .then(function (e) {
                t.appendChild(e);
              }),
              i
                .createSetAttributeValue("div", [
                  ["class", "mr-btn-wrapper " + i.widget.avatar_size],
                ])
                .then(function (e) {
                  (t.onclick = function () {
                    i.mr_toggle(!1, !0);
                  }),
                    (t.ontouch = function () {
                      i.mr_toggle(!1, !0);
                    }),
                    t.appendChild(e);
                }),
              s.appendChild(t),
              sessionStorage.getItem("Makerobos widget impression") ||
                i.sendGoogleEvents(
                  i.widget.integrations.google_id,
                  "Makerobos Widget",
                  "Makerobos widget impression"
                );
          });
      }),
      (MakerobosWidget.prototype.autoWakeupWidget = function () {
        var e = this,
          t = document.getElementById("mkosBTNContainer");
        t.classList.add("mkosBTNContainer"), (t.style.visibility = "visible");
        var o = document.getElementById("makerobos_cont");
        "manual" == this.widget.wakeup_type
          ? 0 < this.widget.wakeup_time &&
            setTimeout(function () {
              "0" == o.style.opacity && e.mr_toggle();
            }, 1e3 * (2 + this.widget.wakeup_time))
          : ((t = Math.round(15 * Math.random())),
            setTimeout(function () {
              "0" == o.style.opacity && e.mr_toggle();
            }, 1e3 * t));
      }),
      (MakerobosWidget.prototype.sendMessage = function (e) {
        try {
          document
            .getElementById("makerobos_chat")
            .contentWindow.postMessage(e, "*");
        } catch (e) {}
      }),
      (MakerobosWidget.prototype.apiRequest = function (i, s, n, e) {
        return new Promise(function (t, o) {
          var e = new XMLHttpRequest();
          (e.onload = function (e) {
            200 === e.target.status
              ? t(e.target.responseText)
              : o(new Error(e.target.responseText));
          }),
            (e.onerror = function (e) {
              o(new Error("XMLHttpRequest Error: " + e.target.responseText));
            }),
            e.open(i, s),
            e.setRequestHeader(
              "content-type",
              "application/json; charset=utf-8"
            ),
            e.send(n);
        });
      }),
      (MakerobosWidget.prototype.recursiveCheck = function () {
        var e = this;
        setTimeout(function () {
          !e.webDomLoaded || e.recursive_count <= 6
            ? e.recursiveCheck()
            : e.loadDOM(),
            (e.recursive_count += 1);
        }, 500);
      }),
      (MakerobosWidget.prototype.WidgetParams = function (e) {
        !0 === this.widgetLoaded
          ? this.sendMessage({ type: "customParams", customParams: e })
          : (-1 != this.pendingMessages.indexOf(e) &&
              this.pendingMessages.push(e),
            setTimeout(function () {
              this.pendingMessages.length &&
                (this.pendingMessages.pop(), this.WidgetParams(e));
            }, 2e3));
      }),
      (MakerobosWidget.prototype.createSetAttributeValue = function (o, i) {
        return new Promise(function (e) {
          var t = document.createElement(o);
          i.forEach(function (e) {
            t.setAttribute(e[0], e[1]);
          }),
            e(t);
        });
      }),
      (MakerobosWidget.prototype.loadAudioFiles = function () {
        var e = this;
        this.createSetAttributeValue("div", [["style", "display:none;"]]).then(
          function (i) {
            e.createSetAttributeValue("audio", [["id", "mkos_audio"]]).then(
              function (o) {
                e.createSetAttributeValue("source", [
                  [
                    "src",
                    "https://makerobosassets.s3.ap-south-1.amazonaws.com/makerobosUnreadSound.ogg",
                    "type",
                    "audio/ogg",
                  ],
                ]).then(function (t) {
                  e.createSetAttributeValue("source", [
                    [
                      "src",
                      "https://makerobosassets.s3.ap-south-1.amazonaws.com/makerobosUnreadSound.mp3",
                      "type",
                      "audio/mp3",
                    ],
                  ]).then(function (e) {
                    o.appendChild(t), o.appendChild(e), i.appendChild(o);
                    try {
                      document.body.appendChild(i);
                    } catch (e) {}
                  });
                });
              }
            );
          }
        );
      }),
      (MakerobosWidget.prototype.checkWidgetHideRules = function (widget) {
        var _this = this;
        return new Promise(function (resolve, reject) {
          if (_this.widget.hide_rules) {
            for (
              var not_contain_score = [],
                path = window.location.pathname,
                hide = !1,
                i = 0;
              i < widget.hide_rules.length;
              i++
            )
              if ("regex" == _this.widget.hide_rules[i].type)
                try {
                  if (path.match(eval(widget.hide_rules[i].value))) {
                    hide = !0;
                    break;
                  }
                } catch (e) {}
              else if ("contains" == widget.hide_rules[i].type) {
                if (path.includes(widget.hide_rules[i].value)) {
                  hide = !0;
                  break;
                }
              } else
                "not_contains" == widget.hide_rules[i].type &&
                  (path.includes(widget.hide_rules[i].value)
                    ? not_contain_score.push(1)
                    : not_contain_score.push(0));
            hide ||
              (not_contain_score.length &&
                (not_contain_score.reduce(function (e, t) {
                  return e + t;
                }) ||
                  (hide = !0))),
              (hide ? reject : resolve)();
          } else resolve();
        });
      }),
      (MakerobosWidget.prototype.waitForLocation = function (e) {
        var t = this;
        !this.userLocation && this._waitLocationCount < 200
          ? setTimeout(function () {
              (t._waitLocationCount += 1), t.waitForLocation(e);
            }, 200)
          : this.sendMessage({
              type: "token",
              token: this.bot_token,
              user_location: this.userLocation || {},
              widget: this.widget,
              session: e,
            });
      }),
      (MakerobosWidget.prototype.tabActiveToggle = function (e) {
        "focus" == e.type
          ? ((this.tab_active = !0),
            this.titleObservable &&
              (clearInterval(this.titleObservable),
              this.toggleTitleFunction(!0)))
          : "blur" == e.type && (this.tab_active = !1);
      }),
      (MakerobosWidget.prototype.toggleTitle = function () {
        try {
          var e = document.getElementsByTagName("title")[0];
          (this.title = e.innerHTML),
            (this.titleObservable = setInterval(this.toggleTitleFunction, 1e3));
        } catch (e) {}
      }),
      (MakerobosWidget.prototype.expandwidget = function () {
        document
          .getElementById("makerobos_container")
          .classList.toggle("expandedWidget");
      }),
      (MakerobosWidget.prototype.startupScripts = function () {
        var i = this;
        document.addEventListener("touch", this.checkButtonClick.bind(this)),
          document.addEventListener("click", this.checkButtonClick.bind(this)),
          window.addEventListener("focus", this.tabActiveToggle.bind(this)),
          window.addEventListener("blur", this.tabActiveToggle.bind(this)),
          window.addEventListener("resize", this.windowResized.bind(this)),
          this.bindEvent(window, "message", function (e) {
            var t, o;
            e.data &&
              ("token" == e.data.type &&
                (i.sendMessage({
                  type: "current_page_url",
                  value: window.location.href,
                }),
                (t = "new"),
                sessionStorage.getItem(i.bot_token)
                  ? (t = "old")
                  : sessionStorage.setItem(i.bot_token, "1"),
                i.waitForLocation(t)),
              e.data.toggle && "close" == e.data.state && i.mr_toggle(),
              "device" == e.data.type &&
                setTimeout(function () {
                  "mobile" == i.widget_user_device
                    ? i.sendMessage({ type: "device", mobile: !0 })
                    : i.sendMessage({ type: "device", mobile: !1 });
                }, 1e3)),
              "expand" == e.data.type && i.expandwidget(),
              "custom_script" == e.data.type &&
                i.executeCustomScript(e.data.src),
              "start_block_data" == e.data.type &&
                ((t = document.getElementById(
                  "makerobos_GlassIframe"
                )).classList.add("launcherBTN" + i.widget.avatar_size),
                "banner_2" == e.data.data.card_type
                  ? t.classList.add("iframe_simpleMessage_type2main")
                  : "banner_3" == e.data.data.card_type
                  ? "mobile" == i.widget_user_device &&
                    t.classList.add("iframe_simpleMessage_type_3_main")
                  : (t.classList.remove("iframe_simpleMessage_type2main"),
                    t.classList.remove("iframe_simpleMessage_type_3_main")),
                i.checkGlassMsgType(e.data),
                i.sendGlassData(e.data, i.widget),
                i.scroll_percent
                  ? (i.auto_wakeup_type = "glass")
                  : i.autoWakeupGlass(),
                "banner_3" == e.data.data.card_type &&
                  "mobile" == i.widget_user_device &&
                  document
                    .getElementById("mkosBTNContainer")
                    .classList.add("buttonInvisible")),
              "widget_wakeup_signal" == e.data.type &&
                (i.scroll_percent
                  ? (i.auto_wakeup_type = "widget")
                  : setTimeout(function () {
                      i.autoWakeupWidget();
                    }, 2e3),
                i.avatar_hidden ||
                  (((o =
                    document.getElementById(
                      "mkosBTNContainer"
                    )).style.visibility = "visible"),
                  o.classList.add("mkosBTNContainer"))),
              "redirect" == e.data.type && (window.location.href = e.data.url),
              "user_registered" == e.data.type &&
                (localStorage.setItem(
                  "mkos_user_id_" + i.widget.bot,
                  e.data.user_id
                ),
                i.verifyWingman()),
              "check_location" == e.data.type && i.getLocation(),
              "start_conv" == e.data.type &&
                (sessionStorage.getItem(
                  "Makerobos widget started conversation"
                ) ||
                  i.sendGoogleEvents(
                    i.widget.integrations.google_id,
                    "Makerobos Widget",
                    "Makerobos widget started conversation"
                  )),
              "pass_search_location" == e.data.type &&
                i.sendMessage({
                  type: "search_location_api",
                  value: e.data.value,
                }),
              "pass_detail_location" == e.data.type &&
                i.sendMessage({
                  type: "detail_location_api",
                  value: e.data.value,
                }),
              "glass_card_height" == e.data.type &&
                i.setGlassMessageHeight(e.data.value),
              "glass_card_close" == e.data.type &&
                (i.hideGlassMessage(),
                setTimeout(function () {
                  document
                    .getElementById("mkosBTNContainer")
                    .classList.remove("buttonInvisible");
                }, 500)),
              "expanded_Card" == e.data.type && i.expandedCard(e.data),
              "media_chat_request" == e.data.type && i.startupHookP2P(e.data),
              "media_chat_close" == e.data.type && i.closeP2PChat(),
              "livechat_agent_detail" == e.data.type &&
                (i.toggleBtn({ avatar_change: !0, image: e.data.image }),
                (i.livechat_agent = e.data)),
              "livechat_ended" == e.data.type &&
                (i.toggleBtn({ avatar_change: !0, image: i.widget.avatar }),
                (i.livechat_agent = e.data)),
              "mute_audio_toggle" == e.data.type &&
                i.muteAudioElToggle(e.data.stream_type, e.data.val),
              "livechat_message_incoming" == e.data.type &&
                (0 == i.livechat_message_counter && i.resetGlassFrameSize(),
                (i.livechat_message_counter += 1),
                i.showTeaserMessageToVisitor(
                  e.data.message,
                  e.data.company_name
                )),
              "livechat_message_clicked" == e.data.type &&
                ((i.livechat_message_counter = 0),
                i.resetGlassFrameSize(),
                i.sendGlassData({ type: "clear_livechat_data" }, i.widget),
                i.hideGlassMessage(),
                i.mr_toggle(!0)),
              "chat_page_loaded" == e.data.type &&
                (e.data.hidden_mode || i.mr_toggle(!0)),
              "popup_url" == e.data.type &&
                (window.popupModelOpen ||
                  i.openModelURL(
                    e.data.url,
                    e.data.media_type,
                    e.data.media_ratio
                  )),
              "livechat_reply" == e.data.type &&
                (i.hideGlassMessage(),
                i.sendMessage({
                  type: "agent_takeover_action",
                  agent_id: e.data.agent_id,
                })),
              "glass_cta_call" == e.data.type &&
                (i.hideGlassMessage(),
                setTimeout(function () {
                  i.checkBlockExist(e.data.block, !0);
                }, 300)),
              "attribute_check" == e.data.type &&
                ((i.widgetLoaded = !0),
                i.checkUTMParams(),
                i.avatar_hidden ||
                  (((o =
                    document.getElementById(
                      "mkosBTNContainer"
                    )).style.visibility = "visible"),
                  o.classList.add("mkosBTNContainer")));
          });
      }),
      (MakerobosWidget.prototype.resetGlassFrameSize = function () {
        var e = document.getElementById("makerobos_GlassIframe");
        e && (e.style.height = "100px");
      }),
      (MakerobosWidget.prototype.unsubscribeScroll = function () {
        window.removeEventListener("scroll", this.pageScrollEvent);
      }),
      (MakerobosWidget.prototype.startFromBlock = function (e) {
        var t = this,
          o = document.getElementById("mkosBTNContainer");
        setTimeout(function () {
          document
            .getElementById("mkosBTNContainer")
            .classList.remove("buttonInvisible");
        }, 1500),
          o &&
            (2 <= e.length
              ? "start" != e[0] &&
                ("new" == e[1]
                  ? setTimeout(function () {
                      t.recursiveBlockRun(e[0], !0);
                    }, 1e3 * (Number(e[2]) ? Number(e[2]) : 0))
                  : Number(e[1]) &&
                    setTimeout(function () {
                      t.recursiveBlockRun(e[0], !0);
                    }, Number(1e3 * e[1])))
              : 1 == e.length && this.recursiveBlockRun(e[0], !1));
      }),
      (MakerobosWidget.prototype.recursiveBlockRun = function (e, t) {
        var o = this;
        this.widgetLoaded
          ? this.sendMessage({
              type: "start_specific_block",
              block: e || "welcome",
              new_conv: t,
            })
          : setTimeout(function () {
              o.recursiveBlockRunCounter < 15 &&
                ((o.recursiveBlockRunCounter += 1), o.recursiveBlockRun(e, t));
            }, 500);
      }),
      (MakerobosWidget.prototype.recursiveBlockCheck = function (e) {
        var t = this;
        this.widgetLoaded
          ? this.checkBlockExist(e)
          : setTimeout(function () {
              t.recBlockCheckCounter < 11 &&
                (t.checkBlockExist(e), (t.recBlockCheckCounter += 1));
            }, 1500);
      }),
      (MakerobosWidget.prototype.checkBlockExist = function (e, t) {
        var o = this,
          i = decodeURIComponent(e).split(":");
        t
          ? (this.updateGlassEvent("click"), this.startFromBlock(i))
          : sessionStorage.getItem("mr_block_list")
          ? JSON.parse(sessionStorage.getItem("mr_block_list")).includes(
              i[0]
            ) && this.startFromBlock(i)
          : this.apiRequest(
              this.apiRequestType.get,
              this.environment[this.env].api +
                "/api/state-list/?bot_id=" +
                this.bot_token
            ).then(function (e) {
              e = JSON.parse(e);
              e.length &&
                (sessionStorage.setItem("mr_block_list", JSON.stringify(e)),
                e.includes(i[0]) && o.startFromBlock(i));
            });
      }),
      (MakerobosWidget.prototype.checkButtonClick = function (e) {
        for (
          var t = "", o = !1, i = e.path || e.composedPath(), s = 0;
          s < i.length;
          s++
        )
          try {
            if (
              i[s].getAttribute("mr_block") ||
              i[s].getAttribute("data-mr_block")
            ) {
              (t =
                i[s].getAttribute("mr_block") ||
                i[s].getAttribute("data-mr_block")),
                (o = !0);
              break;
            }
          } catch (e) {}
        o && this.widgetLoaded && this.checkBlockExist(t);
      }),
      (MakerobosWidget.prototype.mr_toggle = function (e, t) {
        var o = document.getElementById("mkosBTNContainer");
        o.classList.add("mkosBTNContainer"), (o.style.visibility = "visible");
        var i = document.getElementById("makerobos_cont"),
          s = document.getElementById("makerobos_container"),
          n = document.body,
          o = document.getElementsByTagName("html")[0];
        (this.livechat_message_counter = 0),
          this.resetGlassFrameSize(),
          this.sendGlassData({ type: "clear_livechat_data" }, this.widget),
          "1" != i.style.opacity || (null != e && 0 != e)
            ? this.showWidget(n, o, s, i)
            : this.hideWidget(n, o, s, i);
      }),
      (MakerobosWidget.prototype.hideWidget = function (e, t, o, i) {
        var s = this;
        this.toggleNavigationDialogues(!1),
          this.sendMessage({
            type: "toggle",
            width: window.innerWidth,
            state: "hidden",
          }),
          setTimeout(function () {
            i.classList.remove("mkosFadeIn"),
              (o.style.pointerEvents = "none"),
              i.classList.add("mkosFadeOut"),
              i.setAttribute(
                "style",
                "transform: translateX(" +
                  ("right" == s.widget.position ? 10 : -10) +
                  "px); opacity:0; pointer-events:none;"
              ),
              setTimeout(function () {
                o.style.zIndex = "-99";
              }, 200);
          }, 300),
          "mobile" == this.widget_user_device &&
            ((e.style.overflow = ""),
            (t.style.overflow = ""),
            (e.style.position = ""),
            (e.style.width = "")),
          this.toggleBtn({ open: !0 });
      }),
      (MakerobosWidget.prototype.showWidget = function (e, t, o, i) {
        var s = this;
        (this.livechat_message_counter = 0),
          this.resetGlassFrameSize(),
          this.sendGlassData({ type: "clear_livechat_data" }, this.widget),
          this.toggleNavigationDialogues(!0);
        var n = 0;
        "visible" == this.glassMessageState &&
          (this.hideGlassMessage(), (n = 300)),
          setTimeout(function () {
            s.widget_wakeup_once || ((s.widget_wakeup_once = !0), new Date()),
              "mobile" == s.widget_user_device &&
                ((e.style.overflow = "hidden"),
                (e.style.position = "fixed"),
                (e.style.width = "100%"),
                (t.style.overflow = "hidden")),
              clearTimeout(s.glassMessageTimeOut),
              s.hideGlassMessage(),
              "chat_screen" == s.widget.start_screen
                ? s.sendMessage({ type: "start_chat_screen" })
                : s.sendMessage({
                    type: "toggle",
                    width: window.innerWidth,
                    state: "visible",
                  }),
              s.toggleBtn({ open: !1 }),
              setTimeout(
                function () {
                  (o.style.zIndex = "2147483647"),
                    (o.style.pointerEvents = "auto"),
                    i.classList.remove("mkosFadeOut"),
                    i.classList.add("mkosFadeIn"),
                    i.setAttribute(
                      "style",
                      "transform: translateX(0px); opacity:1;"
                    );
                },
                "mobile" == s.widget_user_device ? 50 : 150
              );
          }, n);
      }),
      (MakerobosWidget.prototype.toggleNavigationDialogues = function (e) {}),
      (MakerobosWidget.prototype.sendGoogleEvents = function (
        id,
        action,
        label
      ) {
        try {
          "function" == typeof eval("ga") &&
            eval("ga").getAll().shift().b.data.values[":trackingId"] == id &&
            (sessionStorage.setItem(label, "1"),
            eval(
              'gtag("event", ' +
                action +
                ", {'event_label':" +
                label +
                ", 'event_category':" +
                label +
                "}"
            ));
        } catch (e) {}
      }),
      (MakerobosWidget.prototype.bindEvent = function (e, t, o) {
        e.addEventListener
          ? e.addEventListener(t, o, !1)
          : e.attachEvent && e.attachEvent("on" + t, o);
      }),
      (MakerobosWidget.prototype.urlListeners = function () {
        var t, o;
        (history.pushState =
          ((t = history.pushState),
          function () {
            var e = t.apply(this, arguments);
            return (
              window.dispatchEvent(new Event("pushState")),
              window.dispatchEvent(new Event("locationchange")),
              e
            );
          })),
          (history.replaceState =
            ((o = history.replaceState),
            function () {
              var e = o.apply(this, arguments);
              return (
                window.dispatchEvent(new Event("replaceState")),
                window.dispatchEvent(new Event("locationchange")),
                e
              );
            })),
          window.addEventListener("popstate", function () {
            window.dispatchEvent(new Event("locationchange"));
          }),
          window.addEventListener(
            "locationchange",
            this.urlChangeEvent.bind(this)
          );
      }),
      (MakerobosWidget.prototype.checkUTMParams = function () {
        var o = new URL(window.location.href),
          i = {};
        [
          "utm_term",
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "first_name",
          "last_name",
          "subscribed_email",
          "company_name",
        ].forEach(function (e) {
          var t = o.searchParams.get(e);
          t && ((i[e] = t), 0);
        }),
          ["gclid", "fbclid"].forEach(function (e) {
            var t = o.searchParams.get(e);
            if (t) {
              try {
                (t.includes("[") || t.includes("]") || t.includes("#")) &&
                  (t = (t = (t = t.replace("[", "")).replace("]", "")).split(
                    "#"
                  )[0]);
              } catch (e) {
                t = "";
              }
              (i[e] = t), 0;
            }
          }),
          (i.current_page_url = window.location.href);
        var e = this.getGoogle_Client();
        e && (i.google_client_id = e),
          this.WidgetParams(i),
          !o.hash || ((e = o.hash.substr(1)) && this.checkBlockExist(e));
      }),
      (MakerobosWidget.prototype.getGoogle_Client = function () {
        var gclient, items;
        try {
          "function" == typeof eval("ga") &&
            eval("ga").getAll().length &&
            ((items = eval("ga").getAll()),
            items.forEach(function (e) {
              gclient = e.get("clientId");
            }));
        } catch (e) {}
        return gclient;
      }),
      (MakerobosWidget.prototype.urlChangeEvent = function (e) {
        var t = this;
        e && this.trackSessionHistory(),
          this.widget.hide_rules &&
            this.checkWidgetHideRules(this.widget)
              .then(
                function (e) {
                  "uninstalled" == t.status && t.reInstall();
                },
                function (e) {
                  "installed" == t.status && t.uninstall();
                }
              )
              .catch(function (e) {
                "installed" == t.status && t.uninstall();
              });
      }),
      (MakerobosWidget.prototype.trackSessionHistory = function (e) {
        var o = localStorage.getItem("nav_history");
        if (o)
          try {
            o = JSON.parse(o);
          } catch (e) {}
        else o = { pages: [], landing: {} };
        "number" == typeof o.length &&
          (o = {
            pages: o,
            landing: {
              url: window.location.href,
              timestamp: new Date().toISOString(),
            },
          });
        var i = !1;
        e &&
          (o.landing = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
          o.pages.forEach(function (e, t) {
            e.url == window.location.href &&
              (o.pages.splice(t, 1),
              o.pages.splice(0, 0, {
                url: window.location.href,
                time_spent: e.time_spent,
                timestamp: new Date().toISOString(),
                count: e.count + 1,
              }),
              (i = !0));
          }),
          i ||
            o.pages.splice(0, 0, {
              url: window.location.href,
              time_spent: 0,
              timestamp: new Date().toISOString(),
              count: 1,
            }),
          (this.nav_history = o),
          localStorage.setItem("nav_history", JSON.stringify(o));
      }),
      (MakerobosWidget.prototype.trackTimeSpentOnPage = function () {
        this.nav_history.pages.forEach(function (e) {
          e.url == window.location.href && (e.time_spent += 5);
        }),
          localStorage.setItem("nav_history", JSON.stringify(this.nav_history));
      }),
      (MakerobosWidget.prototype.checkGlassMsgType = function (e) {
        var t;
        "message_button_card" == e.data.card_type &&
          ((t = document.getElementById("makerobos_GlassContainerIn")),
          (e = document.getElementById("makerobos_GlassIframe")),
          t.setAttribute("style", "width: 340px; height: 280px;"),
          e.setAttribute("style", "width: 340px; height: 280px;"),
          e.classList.add("iframe_simpleMessage_type3main"));
      }),
      (MakerobosWidget.prototype.generateGlassMessageDOM = function (e) {
        var i = this,
          t = "_widgetRight";
        "left" == this.widget.position && (t = "_widgetLeft"),
          this.createSetAttributeValue("div", [
            [
              "class",
              "makerobos_GlassMain " + t + " " + this.widget.avatar_size,
            ],
            ["id", "makerobos_Glasscontainer"],
            [
              "style",
              "position: fixed; width: 0px; height: 0px; bottom: 0px; right: 0px; z-index: -99; pointer-events:none;",
            ],
          ]).then(function (o) {
            i
              .createSetAttributeValue("div", [
                ["id", "makerobos_GlassContainerIn"],
                ["class", "makerobos_GlassContainerIn"],
                ["style", "width: 270px; height: 280px;"],
                ["src", i.environment[i.env].glass + "?ver=" + i.version],
              ])
              .then(function (t) {
                i.createSetAttributeValue("iframe", [
                  ["id", "makerobos_GlassIframe"],
                  ["title", "makerobos Widget Glass Iframe"],
                  ["class", "makerobos_GlassIframe"],
                  ["src", i.environment[i.env].glass + "?ver=" + i.version],
                  ["style", "width: 270px; height: 100px;"],
                ]).then(function (e) {
                  t.appendChild(e), o.appendChild(t);
                });
              }),
              i
                .createSetAttributeValue("div", [
                  ["class", "_mkosBotGradient"],
                  ["id", "_mkosBotGradient"],
                  [
                    "style",
                    "z-index: 2147482998; display:none; position: fixed; width: 500px; height: 500px; bottom: 0; content: ''; pointer-events: none;",
                  ],
                ])
                .then(function (e) {
                  o.appendChild(e);
                });
            var e = document.getElementsByTagName("body")[0];
            e && e.appendChild(o);
          });
      }),
      (MakerobosWidget.prototype.autoWakeupGlass = function () {
        var e = this,
          t = document.getElementById("mkosBTNContainer");
        t.classList.add("mkosBTNContainer"), (t.style.visibility = "visible");
        var o = document.getElementById("makerobos_cont");
        "manual" == this.widget.wakeup_type
          ? 0 < this.widget.wakeup_time &&
            (this.glassMessageTimeOut = setTimeout(function () {
              "1" != o.style.opacity && e.showGlassMessages();
            }, 1e3 * (2 + this.widget.wakeup_time)))
          : ((t = Math.round(15 * Math.random())),
            (this.glassMessageTimeOut = setTimeout(function () {
              "1" != o.style.opacity && e.showGlassMessages();
            }, 1e3 * t)));
      }),
      (MakerobosWidget.prototype.hideGlassMessage = function () {
        var e = document.getElementById("makerobos_GlassIframe");
        e &&
          (e.classList.remove("show"),
          (document.getElementById("_mkosBotGradient").style.display = "none"),
          ((e = document.getElementById(
            "makerobos_Glasscontainer"
          )).style.zIndex = "99"),
          (e.style.pointerEvents = "none"),
          (this.glassMessageState = "hidden"),
          this.toggleBtn({ galssOpen: !1 }));
      }),
      (MakerobosWidget.prototype.expandedCard = function (e) {
        var t = document.getElementById("makerobos_GlassIframe");
        t &&
          ((t.style.height = e.height + "px"),
          t.classList.add("iframe_simpleMessage_type2"));
      }),
      (MakerobosWidget.prototype.showGlassMessages = function (e) {
        if (
          !e &&
          this.widget.teaser_session &&
          sessionStorage.getItem("teaser_message_status")
        )
          return !1;
        "1" != document.getElementById("makerobos_cont").style.opacity &&
          (document
            .getElementById("makerobos_GlassIframe")
            .classList.add("show"),
          (document.getElementById("_mkosBotGradient").style.display = ""),
          ((e = document.getElementById(
            "makerobos_Glasscontainer"
          )).style.zIndex = "214748361"),
          (e.style.pointerEvents = "auto"),
          (this.glassMessageState = "visible"),
          this.toggleBtn({
            galssOpen: !0,
            msg_count: this.livechat_message_counter,
          }),
          this.playAudio(),
          sessionStorage.setItem("teaser_message_status", "1"),
          this.updateGlassEvent("view"));
      }),
      (MakerobosWidget.prototype.setGlassMessageHeight = function (e) {
        document.getElementById("makerobos_GlassIframe").style.height =
          e + "px";
      }),
      (MakerobosWidget.prototype.sendGlassData = function (e, t) {
        try {
          var o = document.getElementById("makerobos_GlassIframe");
          (e.widget = t),
            o.contentWindow.postMessage(e, "*"),
            (this.glassMessage_id = e.data.temp_id);
        } catch (e) {}
      }),
      (MakerobosWidget.prototype.updateGlassEvent = function (e) {
        var t = JSON.stringify({
            type: "update_glass_event",
            glass_id: this.glassMessage_id,
            event_type: e,
            bot: this.bot_token,
          }),
          e = this.environment[this.env].api + "/widget/update-glass-event/";
        this.apiRequest(this.apiRequestType.post, e, t).then(function (e) {
          e = JSON.parse(e);
          console.log("Glass Message " + e.message);
        });
      }),
      (MakerobosWidget.prototype.playAudio = function () {
        var e = document.querySelector("#mkos_audio");
        e && e.play();
      }),
      (MakerobosWidget.prototype.executeCustomScript = function (s) {
        try {
          eval(s);
        } catch (e) {}
      }),
      (MakerobosWidget.prototype.getLocation = function () {
        var t = this;
        "geolocation" in navigator
          ? navigator.geolocation.getCurrentPosition(
              function (e) {
                t.sendMessage({
                  type: "geolocation",
                  status: !0,
                  lat: e.coords.latitude,
                  lng: e.coords.longitude,
                });
              },
              function (e) {
                t.sendMessage({
                  type: "geolocation",
                  status: !1,
                  message:
                    "You denied or location service is blocked, please search your location",
                });
              }
            )
          : this.sendMessage({
              type: "geolocation",
              status: !1,
              message:
                "location service is not supported on your browser, please search your location",
            });
      }),
      (MakerobosWidget.prototype.uninstall = function () {
        var t;
        [
          "makerobos_container",
          "mkosBTNContainer",
          "makerobos_Glasscontainer",
        ].forEach(function (e) {
          (t = document.getElementById(e)), document.body.removeChild(t);
        }),
          (this.status = "uninstalled");
      }),
      (MakerobosWidget.prototype.destroy = function () {
        var t;
        [
          "makerobos_container",
          "mkosBTNContainer",
          "makerobos_Glasscontainer",
        ].forEach(function (e) {
          (t = document.getElementById(e)), document.body.removeChild(t);
        }),
          sessionStorage.setItem("widget_destroyed", "true"),
          (this.status = "destroyed");
      }),
      (MakerobosWidget.prototype.forceReload = function () {
        var t,
          o = this;
        "destroyed" == this.status &&
          ([
            "makerobos_container",
            "mkosBTNContainer",
            "makerobos_Glasscontainer",
          ].forEach(function (e) {
            t = document.getElementById(e);
            try {
              document.body.removeChild(t);
            } catch (e) {}
          }),
          this.checkWidgetHideRules(this.widget)
            .then(
              function (e) {
                o.loadDOM();
              },
              function (e) {}
            )
            .catch(function (e) {})),
          sessionStorage.removeItem("widget_destroyed");
      }),
      (MakerobosWidget.prototype.reInstall = function (e) {
        var t = this;
        ("destroyed" == this.status && !e) ||
          this.checkWidgetHideRules(this.widget)
            .then(
              function (e) {
                t.loadDOM();
              },
              function (e) {}
            )
            .catch(function (e) {});
      }),
      (MakerobosWidget.prototype.closeModelURL = function () {
        window.popupModelOpen = !1;
        var e,
          t = document.querySelector("#mkos_popup_model");
        t &&
          ((e = document.querySelector("#mkosModelGalleryWrapper")) &&
            e.classList.remove("mkosModelGalleryWrapperOpen"),
          setTimeout(function () {
            document.body.removeChild(t);
          }, 200));
      }),
      (MakerobosWidget.prototype.openModelURL = function (i, s, o) {
        var n = this;
        (window.popupModelOpen = !0),
          this.createSetAttributeValue("div", [
            ["class", "_mkosModelGallery _mkosModelGalleryShow"],
            ["id", "mkos_popup_model"],
          ]).then(function (e) {
            document.body.appendChild(e),
              n
                .createSetAttributeValue("div", [
                  ["class", "_mkosModelGalleryIn"],
                ])
                .then(function (t) {
                  e.appendChild(t),
                    n
                      .createSetAttributeValue("div", [
                        ["class", "_mkosModelGalleryCloseBG"],
                      ])
                      .then(function (e) {
                        t.appendChild(e),
                          e.addEventListener("click", n.closeModelURL.bind(n));
                      }),
                    n
                      .createSetAttributeValue("div", [
                        ["class", "_mkosModelGalleryWrapper"],
                        ["id", "mkosModelGalleryWrapper"],
                      ])
                      .then(function (e) {
                        setTimeout(function () {
                          e.classList.add("mkosModelGalleryWrapperOpen"),
                            "portrait" == o &&
                              e.classList.add("_mkosModelGalleryPrtrait");
                        }, 300),
                          t.appendChild(e),
                          n
                            .createSetAttributeValue("div", [
                              ["class", "_mkosModelGalleryCont"],
                            ])
                            .then(function (o) {
                              e.appendChild(o),
                                n
                                  .createSetAttributeValue("div", [
                                    ["class", "_mkosModelGalleryClose"],
                                  ])
                                  .then(function (e) {
                                    e.addEventListener(
                                      "click",
                                      n.closeModelURL.bind(n)
                                    ),
                                      (e.innerHTML =
                                        'Close<svg class="_mkosModelGalleryCloseIcon" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"> <g id="icon/close" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g transform="translate(0.000000, 0.186302)" fill-rule="nonzero"> <g id="icon/downarrow-copy"> <rect id="Rectangle" x="0" y="0" width="24" height="24"></rect> </g> <g id="Group-5" transform="translate(5.000000, 5.000000)" fill="#fff"> <polygon id="Path-2" points="-0.0695280832 0.640061719 0.639180859 -0.0654392631 14.040901 13.3972194 13.332192 14.1027204"></polygon><polygon id="Path-2" points="13.3642653 -0.0365739791 14.0697663 0.672134963 0.607107614 14.0738551 -0.0983933672 13.3651461"></polygon></g></g></g></svg>'),
                                      o.appendChild(e);
                                  }),
                                n
                                  .createSetAttributeValue("div", [
                                    ["class", "_mkoGalleryHold"],
                                  ])
                                  .then(function (t) {
                                    "image" == s &&
                                      n
                                        .createSetAttributeValue("img", [
                                          ["class", "_mkoGalleryThumb"],
                                          ["src", i],
                                        ])
                                        .then(function (e) {
                                          t.appendChild(e), o.appendChild(t);
                                        }),
                                      "video" == s &&
                                        n
                                          .createSetAttributeValue("iframe", [
                                            ["class", "_mkoGalleryVideo"],
                                            ["src", i],
                                            [
                                              "allowfullscreen",
                                              "allowfullscreen",
                                            ],
                                            ["allow", "accelerometer"],
                                            ["autoplay", ""],
                                            ["encrypted-media", ""],
                                            ["gyroscope", ""],
                                            ["picture-in-picture", ""],
                                            ["width", "560"],
                                            ["height", "315"],
                                            ["frameborder", "0"],
                                            [
                                              "allow",
                                              "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
                                            ],
                                            ["allowfullscreen", "true"],
                                          ])
                                          .then(function (e) {
                                            t.appendChild(e), o.appendChild(t);
                                          });
                                  });
                            });
                      });
                });
          });
      }),
      (MakerobosWidget.prototype.parseGreeting = function (a, r) {
        return new Promise(function (e, t) {
          for (var o, i, s, n = /{{(.*?)}}/g; (o = n.exec(a)); )
            o &&
              (/[ !@#$%^&*()+\-=\[\]{};':"\\,.<>\/?]/.test(o[1]) ||
                ((i = o[1].split("|")[0]),
                (s = o[1].split("|")[1]),
                (a = r[i]
                  ? a.substr(0, o.index) +
                    r[i] +
                    a.substr(o.index + o[0].length, a.length)
                  : a.substr(0, o.index) +
                    s +
                    a.substr(o.index + o[0].length, a.length))));
          e(a);
        });
      }),
      (MakerobosWidget.prototype.checkWebsocketCondition = function () {
        console.log(this.environment[this.env].socket +
          "/socket/visitor/" +
          this.widget.bot +
          "/" +
          this.widget.visitor_id +
          "/" +
          e +
          "/");
        var e = this;
        this.widget.visitor_id &&
        this.userLocation.city &&
        "open" != this.ws_status
          ? this.connectToWebsocket()
          : "open" != this.ws_status &&
            setTimeout(function () {
              e.checkWebsocketCondition();
            }, 2e3);
      }),
      (MakerobosWidget.prototype.connectToWebsocket = function () {
        console.log(this.environment[this.env].socket +
          "/socket/visitor/" +
          this.widget.bot +
          "/" +
          this.widget.visitor_id +
          "/" +
          e +
          "/");
        var s = this,
          e = this.env;
        "prod" != e && "dev" != e && (e = "local"),
          (this.chatSocket = new WebSocket(
            this.environment[this.env].socket +
              "/socket/visitor/" +
              this.widget.bot +
              "/" +
              this.widget.visitor_id +
              "/" +
              e +
              "/"
          )),
          (this.chatSocket.onopen = function (e) {
            (s.ws_status = "open"),
              console.log("socket connected"),
              (s.reconnect_websocket_count = 0);
            var t = new Date(),
              o = localStorage.getItem("mkos_user_id_" + s.widget.bot),
              i = {};
            o
              ? ((i = {
                  visitor_id: s.widget.visitor_id,
                  bot_id: s.widget.bot,
                  timestamp: t.getTime(),
                  last_updated: t.getTime(),
                  offset: t.getTimezoneOffset(),
                  user_type: o ? "active" : "visitor",
                  user_id: o,
                  active_days: [new Date().toISOString()],
                  session_time: s.getTotalTimeSpent(),
                  current_page: window.location.href,
                  location: s.userLocation,
                  status: "online",
                }),
                setTimeout(function () {
                  s.sendSocketMessage({
                    type: "update_active_days",
                    day: new Date().toISOString(),
                  });
                }, 1e3))
              : (i = {
                  visitor_id: s.widget.visitor_id,
                  bot_id: s.widget.bot,
                  timestamp: t.getTime(),
                  last_updated: t.getTime(),
                  offset: t.getTimezoneOffset(),
                  user_type: o ? "active" : "visitor",
                  user_id: o,
                  active_days: [new Date().toISOString()],
                  session_time: s.getTotalTimeSpent(),
                  current_page: window.location.href,
                  location: s.userLocation,
                  status: "online",
                }),
              s.sendSocketMessage({ type: "create_update_visitor", data: i });
          }),
          (this.chatSocket.onmessage = function (e) {
            console.log(e);
            e = JSON.parse(e.data);
            e.agent_message &&
              (s.agent_messages.push(e.agent_message),
              localStorage.getItem("mkos_user_id_" + s.widget.bot) ||
                s.sendMessage({
                  type: "create_mau_by_agent",
                  agent_id: e.agent_id,
                }));
          }),
          (this.chatSocket.onclose = function (e) {
            (s.ws_status = "closed"),
              console.error("Chat socket closed unexpectedly"),
              console.log("reconnecting.."),
              s.reconnect_websocket_count < 20 &&
                setTimeout(function () {
                  (s.reconnect_websocket_count += 1), s.connectToWebsocket();
                }, 500 * s.reconnect_websocket_count);
          });
      }),
      (MakerobosWidget.prototype.getTotalTimeSpent = function () {
        var t = 0;
        return (
          this.nav_history.pages &&
            this.nav_history.pages.forEach(function (e) {
              e.time_spent && (t += e.time_spent);
            }),
          t
        );
      }),
      (MakerobosWidget.prototype.showTeaserMessageToVisitor = function (e, t) {
        t = {
          type: "livechat_data",
          data: {
            card_type: "message",
            filters: [],
            agent: this.livechat_agent.agent,
            agent_img: this.livechat_agent.image,
            msg_card: { message: e, cta_list: [], show_model_seq: null },
            company_name: t,
          },
        };
        this.checkGlassMsgType(t),
          this.sendGlassData(t, this.widget),
          this.showGlassMessages(!0);
      }),
      (MakerobosWidget.prototype.updateVisitorInfo = function () {
        var e;
        "open" == this.ws_status &&
          ((e = localStorage.getItem("mkos_user_id_" + this.widget.bot)),
          (e = {
            last_updated: new Date().getTime(),
            user_type: e ? "active" : "visitor",
            current_page: window.location.href,
            user_id: e,
            session_time: this.getTotalTimeSpent(),
            nav_history: this.nav_history,
            status: "online",
          }),
          this.sendSocketMessage({ type: "update_visitor", data: e }));
      }),
      (MakerobosWidget.prototype.recursiveVisitorUpdate = function () {
        var e = this;
        setTimeout(function () {
          e.updateVisitorInfo(), e.recursiveVisitorUpdate();
        }, 1e4);
      }),
      (MakerobosWidget.prototype.sendSocketMessage = function (e) {
        this.chatSocket.send(JSON.stringify(e));
      }),
      (MakerobosWidget.prototype.startupHookP2P = function (t) {
        var o = this;
        this.closeP2PChat(),
          setTimeout(function () {
            var e;
            o.createAudioDOM(),
              (o.scripts.status = !0),
              document.getElementById("socket_script")
                ? (o.scripts.socket = !0)
                : ((e = document.createElement("script")).setAttribute(
                    "id",
                    "socket_script"
                  ),
                  e.setAttribute(
                    "src",
                    "https://makerobosfastcdn.s3.ap-south-1.amazonaws.com/cdn/socket.io.js"
                  ),
                  document.body.appendChild(e),
                  (e.onload = function () {
                    o.scripts.socket = !0;
                  })),
              document.getElementById("web_rtc")
                ? (o.scripts.rtc = !0)
                : ((e = document.createElement("script")).setAttribute(
                    "id",
                    "web_rtc"
                  ),
                  e.setAttribute(
                    "src",
                    "https://makerobosfastcdn.s3.ap-south-1.amazonaws.com/cdn/webRTC.js"
                  ),
                  document.body.appendChild(e),
                  (e.onload = function () {
                    o.scripts.rtc = !0;
                  })),
              o.recursiveCheckScriptLoad(t);
          }, 500);
      }),
      (MakerobosWidget.prototype.createAudioDOM = function () {
        var e = document.getElementById("mkos_media_cont");
        e
          ? (e.innerHTML = "")
          : this.createSetAttributeValue("div", [
              ["id", "mkos_media_cont"],
              ["style", "display:none;"],
            ]).then(function (e) {});
      }),
      (MakerobosWidget.prototype.recursiveCheckScriptLoad = function (e) {
        var t = this;
        this.scripts.socket && this.scripts.rtc
          ? this.joinSocketConnection(e)
          : setTimeout(function () {
              console.log("loading script"), t.recursiveCheckScriptLoad(e);
            }, 500);
      }),
      (MakerobosWidget.prototype.joinSocketConnection = function (e) {
        this.sendMessage({ type: "media_request_status", status: "pending" }),
          (this.connection = new RTCMultiConnection()),
          (this.connection.socketURL = "https://sturnserve.makerobos.com/"),
          (this.connection.session = {
            audio: e.audio,
            video: e.video,
            data: !0,
          }),
          (this.connection.mediaConstraints = {
            audio: e.audio,
            video: e.video,
          }),
          (this.connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: e.audio,
            OfferToReceiveVideo: e.video,
          }),
          (this.connection.onstream = this.onStream.bind(this)),
          (this.connection.onopen = this.onOpenStream.bind(this)),
          this.connection.join(e.room_id);
      }),
      (MakerobosWidget.prototype.onOpenStream = function (e) {
        this.sendMessage({ type: "media_request_status", status: "active" }),
          console.log("voice connection is open");
      }),
      (MakerobosWidget.prototype.onStream = function (e) {
        this.tracks.push(e.streamid);
        var t = document.getElementById("mkos_media_cont");
        (e.mediaElement.style = "height:175px;width:100%;"),
          t.appendChild(e.mediaElement);
      }),
      (MakerobosWidget.prototype.muteAudioElToggle = function (t, o) {
        if (this.connection) {
          var e = [];
          try {
            e = this.connection.streamEvents.selectAll();
          } catch (e) {}
          e.forEach(function (e) {
            e.type == t && (o ? e.stream.mute() : e.stream.unmute());
          });
        }
      }),
      (MakerobosWidget.prototype.closeP2PChat = function () {
        (this.scripts.status = !1),
          this.tracks.forEach(function (e) {
            var t = document.getElementById(e);
            t &&
              t.srcObject.getTracks().forEach(function (e) {
                e.stop(), (t.srcObject = null);
              });
          }),
          (this.tracks = []);
        var e = document.getElementById("mkos_media_cont");
        e && (e.innerHTML = "");
        try {
          (this.connection.onstream = null),
            (this.connection.onopen = null),
            this.connection.close(),
            this.connection.disconnect(),
            this.connection.closeSocket(),
            (this.connection = null);
        } catch (e) {}
      }),
      (MakerobosWidget.prototype.verifyWingman = function () {
        var t = this,
          e =
            this.environment[this.env].api +
            "/api/verify-wingman/?token=" +
            this.bot_token;
        this.apiRequest(this.apiRequestType.get, e)
          .then(function (e) {
            JSON.parse(e).flag &&
              ((t.verifiedWingman = !0),
              t.checkWebsocketCondition(),
              setTimeout(function () {
                t.recursiveVisitorUpdate();
              }, 1e4));
          })
          .catch(function (e) {
            console.log(e);
          });
      }),
      MakerobosWidget
    );
  })(),
  mkos = new MakerobosWidget();
  mkos.checkWebsocketCondition()
 
