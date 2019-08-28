let readline = require('readline');
let fs = require('fs');
const {exec} = require('child_process');

//发布需要使用的信息
const INFOS = {
    project:null,
    version:null
    // project:'TA',
    // version:'hello'
};
const rl = rlFor();

main();

async function main() {
    await getInfos();
    await pullSvn();
    await mkVerison();
    await commitSvn();
    process.exit();
}

function question (query) {
    return new Promise(resolve => rl.question(query, (answer) => resolve(answer)));
}
function rlFor(){
    return readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });
}
async function getInfos(){
    INFOS.project = await question('请输入本次发布的项目名称：');
    console.log('项目名称：'+ INFOS.project);
    INFOS.version = await question('请输入本次发布的版本号：');
    console.log('版本号：'+ INFOS.version);
    const checkFlag = await question('请问信息是否确认无误？(Y/N)');
    return checkInfo(checkFlag);
}
//拉取pullSvn最新版本至本地
function pullSvn() {
    if (!projectFor(INFOS.project)) {
        console.log('该项目不存在,请重新输入');
        return getInfos();
    }
    return projectFor(INFOS.project)();

    function projectFor(key) {
        const projectMap = {
            TA:async ()=>{
                const svnUrl = `https://github.com/yicheny/webStrategy.git`;
                await exec_order(`git clone ${svnUrl}`)
            }
        };

        return projectMap[key]
    }
}

//使用获取的版本号为拉取的文件夹重命名
function mkVerison(){
    console.log('使用获取的版本号为拉取的文件夹重命名...');
    const {project,version} = INFOS;
    return new Promise((resolve,reject)=>{
        fs.rename(getProjectName(project),version,(err)=>{
            if(err){
                reject(err)
            }
            resolve()
        })
    }).then(async()=>{
        console.log('创建本地发布版本成功');
        const url = (__dirname + `\\${INFOS.version}\\.git`);
        await exec_order('echo Y|rd /S '+ url);
        console.log('删除.git文件');
    }).catch(err=>{
        return console.log('创建本地发布版本失败：' + err)
    });

    function getProjectName(key) {
        const projectNameMap = {
            'TA':'webStrategy'
        };
        return projectNameMap[key]
    }
}
function checkInfo(flag) {
    if(flag.toUpperCase() === 'Y') return console.log('信息确认无误，拉取最新版本到本地...');
    console.log('请重新输入信息');
    return getInfos();
}

async function commitSvn() {
    console.log('添加文件中...');
    await exec_order(`git add ${INFOS.version}/`);
    console.log('提交文件中...');
    await exec_order(`git commit -m "提交描述8"`);
}

function exec_order(order) {
    return new Promise((resolve,reject)=>{
        exec(order, (err, stdout, stderr) => {
            if(err) {
                reject(err)
            }
            resolve(stdout,stderr)
        });
    }).then((stdout,stderr)=>{
        // console.log('stdout',stdout);
        // console.log('stderr',stderr);
    }).catch(err=>{
        // console.log('err',err)
    });
}