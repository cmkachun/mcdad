/**
 * 麦当劳开屏全方位清理 - 针对随机命名视频优化
 */

let url = $request.url;
let body = $response.body;

if (body) {
    // 1. 无论是哪个接口，只要 body 里出现了那个恶意视频 ID 或链接，全部抹掉
    body = body.replace(/4e94c52aa0203777/g, "cmkachun_no_ad");
    body = body.replace(/https?:\/\/img\.mcd\.cn\/[^\s"]+\.mp4/g, "");

    if (url.includes("bff/portal/version/mdl")) {
        try {
            let obj = JSON.parse(body);
            // 清理掉所有可能携带视频链接的 module
            if (obj.data && obj.data.modules) {
                obj.data.modules = obj.data.modules.filter(item => {
                    const name = (item.moduleName || "").toLowerCase();
                    return !["splash", "ad", "video", "guide", "pop"].some(k => name.includes(k));
                });
            }
            if (obj.hasOwnProperty('audit')) obj.audit = true;
            body = JSON.stringify(obj);
        } catch (e) {}
    }
}

$done({ body });
