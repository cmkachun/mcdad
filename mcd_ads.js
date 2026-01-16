/**
 * 麦当劳开屏全方位清理 - cmkachun
 * 针对抓到的 4e94c52aa0203777.mp4 进行优化
 */

let body = $response.body;
let url = $request.url;

if (body) {
    // 1. 暴力抹除：无论在哪个 JSON 里看到这个视频 ID，直接替换掉
    if (body.includes("4e94c52aa0203777")) {
        body = body.replace(/4e94c52aa0203777/g, "no_more_ads");
        console.log("cmkachun: 已在数据中抹除特定广告 ID");
    }

    // 2. 针对配置接口的结构化清理
    if (url.includes("bff/portal/version/mdl")) {
        try {
            let obj = JSON.parse(body);
            if (obj.data && obj.data.modules) {
                // 移除所有包含广告嫌疑的模块
                obj.data.modules = obj.data.modules.filter(item => {
                    const mName = (item.moduleName || "").toLowerCase();
                    return !["splash", "ad", "video", "pop", "guide"].some(k => mName.includes(k));
                });
            }
            // 开启审计模式，部分 App 会因此跳过广告
            if (obj.hasOwnProperty('audit')) obj.audit = true;
            body = JSON.stringify(obj);
        } catch (e) {
            console.log("cmkachun: JSON 解析失败，执行字符串替换逻辑");
        }
    }
}

$done({ body });
