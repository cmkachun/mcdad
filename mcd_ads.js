/**
 * 麦当劳开屏广告清理
 * 开发者: cmkachun
 */

let body = $response.body;
if (body) {
    try {
        let obj = JSON.parse(body);
        
        // 1. 过滤掉包含开屏或广告关键词的模块
        if (obj.data && obj.data.modules) {
            obj.data.modules = obj.data.modules.filter(item => {
                const name = (item.moduleName || "").toLowerCase();
                return !name.includes("splash") && !name.includes("ad") && !name.includes("video");
            });
            console.log("cmkachun: 麦当劳开屏/广告模块已移除");
        }

        // 2. 将审计模式设为 true (有时这会跳过开屏广告检测)
        if (obj.hasOwnProperty('audit')) {
            obj.audit = true;
        }

        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("cmkachun: 脚本执行异常: " + e);
        $done({});
    }
} else {
    $done({});
}
