/**
 * 麦当劳深度去占位符脚本 - cmkachun
 */

let body = $response.body;
let url = $request.url;

if (body) {
    // 1. 依然保留对 mp4 地址的物理抹除
    body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");

    // 2. 针对版本配置接口，彻底删除广告模块节点
    if (url.includes("bff/portal/version/mdl")) {
        try {
            let obj = JSON.parse(body);
            if (obj.data && obj.data.modules) {
                // 定义需要剔除的模块关键词
                // splash: 开屏, ad: 广告, pop: 弹窗, index-video: 首页视频
                const blacklist = ["splash", "pop", "adv", "video", "guide"];
                
                obj.data.modules = obj.data.modules.filter(m => {
                    const mName = (m.moduleName || "").toLowerCase();
                    const shouldRemove = blacklist.some(k => mName.includes(k));
                    if (shouldRemove) console.log(`cmkachun: 已移除模块 [${mName}]`);
                    return !shouldRemove;
                });
            }
            
            // 尝试开启审核模式，有时候能让首页布局更紧凑
            if (obj.hasOwnProperty('audit')) obj.audit = true;
            
            body = JSON.stringify(obj);
        } catch (e) {
            console.log("cmkachun: JSON处理异常");
        }
    }
}

$done({ body });
