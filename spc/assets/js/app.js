(function () {
    document.querySelectorAll("form[data-confirm]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var message = form.getAttribute("data-confirm");
            if (message && !window.confirm(message)) {
                event.preventDefault();
            }
        });
    });

    var log = document.getElementById("chat-log");
    if (log) {
        log.scrollTop = log.scrollHeight;
    }
    var composer = document.querySelector(".chat-form textarea");
    if (composer) {
        composer.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                var send = composer.form.querySelector("[name=send]");
                if (send) {
                    send.click();
                }
            }
        });
    }

    var dataNode = document.getElementById("chart-data");
    var canvas = document.getElementById("monthChart");
    if (!dataNode || !canvas) {
        return;
    }

    var data = JSON.parse(dataNode.textContent);
    var current = data.initial || "sugar";
    var statusColor = {
        normal: "#1f7a4d",
        low: "#9a6700",
        under: "#9a6700",
        border: "#9a6700",
        elevated: "#9a6700",
        stage1: "#9a6700",
        over: "#9a6700",
        high: "#a12626",
        obese: "#a12626",
        crisis: "#8d153a"
    };

    function fit(target) {
        var dpr = window.devicePixelRatio || 1;
        var width = target.clientWidth || 640;
        var height = 280;
        target.width = Math.max(1, Math.floor(width * dpr));
        target.height = Math.floor(height * dpr);
        var ctx = target.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx: ctx, w: width, h: height };
    }

    function render(model) {
        var box = canvas.parentElement;
        var tip = box.querySelector(".chart-tip");
        var empty = box.querySelector(".chart-empty");
        var caption = document.getElementById("chart-caption");
        if (caption) {
            caption.textContent = model.caption || "";
        }
        var lines = (model.lines || []).filter(function (line) {
            return line.values && line.values.length;
        });
        if (!lines.length) {
            empty.hidden = false;
            canvas.hidden = true;
            tip.hidden = true;
            return;
        }
        empty.hidden = true;
        canvas.hidden = false;
        var view = fit(canvas);
        var ctx = view.ctx;
        var plot = { x: 46, y: 16, w: Math.max(20, view.w - 64), h: view.h - 48 };
        var labels = lines[0].labels || [];
        var dates = lines[0].dates || [];
        var values = [];
        lines.forEach(function (line) {
            line.values.forEach(function (value) {
                if (value !== null && value !== undefined) {
                    values.push(Number(value));
                }
            });
        });
        (model.guides || []).forEach(function (guide) {
            values.push(Number(guide.value));
        });
        if (model.band) {
            values.push(Number(model.band[0]), Number(model.band[1]));
        }
        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values);
        if (min === max) {
            min -= 1;
            max += 1;
        }
        var pad = (max - min) * 0.12;
        min -= pad;
        max += pad;

        function yOf(value) {
            return plot.y + plot.h - ((value - min) / (max - min)) * plot.h;
        }
        function xOf(index) {
            if (labels.length <= 1) {
                return plot.x + plot.w / 2;
            }
            return plot.x + (plot.w * index) / (labels.length - 1);
        }

        ctx.clearRect(0, 0, view.w, view.h);
        ctx.save();
        ctx.beginPath();
        ctx.rect(plot.x, plot.y, plot.w, plot.h);
        ctx.clip();
        if (model.band) {
            var y1 = yOf(model.band[1]);
            var y2 = yOf(model.band[0]);
            ctx.fillStyle = "rgba(31, 122, 77, 0.12)";
            ctx.fillRect(plot.x, Math.min(y1, y2), plot.w, Math.abs(y2 - y1));
        }
        ctx.restore();

        ctx.strokeStyle = "#efe6d6";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#6d7886";
        ctx.font = "12px Nirmala UI, Segoe UI, sans-serif";
        ctx.textAlign = "right";
        for (var g = 0; g < 4; g++) {
            var value = min + ((max - min) * g) / 3;
            var y = yOf(value);
            ctx.beginPath();
            ctx.moveTo(plot.x, y);
            ctx.lineTo(plot.x + plot.w, y);
            ctx.stroke();
            ctx.fillText(String(Math.round(value * 10) / 10), plot.x - 8, y + 4);
        }

        (model.guides || []).forEach(function (guide) {
            var y = yOf(guide.value);
            ctx.save();
            ctx.strokeStyle = "#8d153a";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(plot.x, y);
            ctx.lineTo(plot.x + plot.w, y);
            ctx.stroke();
            ctx.restore();
        });

        var hits = [];
        lines.forEach(function (line) {
            ctx.beginPath();
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 2.4;
            ctx.lineJoin = "round";
            var started = false;
            line.values.forEach(function (value, index) {
                if (value === null || value === undefined) {
                    started = false;
                    return;
                }
                var x = xOf(index);
                var y = yOf(Number(value));
                if (!started) {
                    ctx.moveTo(x, y);
                    started = true;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            line.values.forEach(function (value, index) {
                if (value === null || value === undefined) {
                    return;
                }
                var x = xOf(index);
                var y = yOf(Number(value));
                ctx.beginPath();
                ctx.fillStyle = statusColor[line.statuses[index]] || line.color;
                ctx.arc(x, y, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });
        });

        labels.forEach(function (label, index) {
            hits.push({ x: xOf(index), index: index });
        });
        ctx.fillStyle = "#6d7886";
        ctx.textAlign = "center";
        var step = Math.ceil(labels.length / 8);
        labels.forEach(function (label, index) {
            if (index % step !== 0 && index !== labels.length - 1) {
                return;
            }
            ctx.fillText(String(label), xOf(index), plot.y + plot.h + 22);
        });

        canvas.onmousemove = function (event) {
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var nearest = null;
            hits.forEach(function (hit) {
                var dist = Math.abs(hit.x - x);
                if (!nearest || dist < nearest.dist) {
                    nearest = { dist: dist, index: hit.index, x: hit.x };
                }
            });
            if (!nearest || nearest.dist > 28) {
                tip.hidden = true;
                return;
            }
            var rows = ["<strong>" + (dates[nearest.index] || labels[nearest.index]) + "</strong>"];
            lines.forEach(function (line) {
                var value = line.values[nearest.index];
                if (value === null || value === undefined) {
                    return;
                }
                rows.push(line.name + ": " + value + (model.unit && line.name !== "BMI" ? " " + model.unit : ""));
            });
            tip.innerHTML = rows.join("<br>");
            tip.hidden = false;
            var left = nearest.x + 12;
            if (left > view.w - 160) {
                left = nearest.x - 150;
            }
            tip.style.left = left + "px";
            tip.style.top = "24px";
        };
        canvas.onmouseleave = function () {
            tip.hidden = true;
        };
    }

    function show(key) {
        current = key;
        document.querySelectorAll(".tab").forEach(function (tab) {
            tab.classList.toggle("is-on", tab.getAttribute("data-series") === key);
        });
        render(data[key] || { lines: [] });
    }

    document.querySelectorAll(".tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
            show(tab.getAttribute("data-series"));
        });
    });
    show(current);
    window.addEventListener("resize", function () {
        show(current);
    });
})();
