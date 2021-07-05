const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const MetalSmith = require("metalsmith"); // 遍历文件夹
let ncp = require("ncp");
var inquirer = require("inquirer");
let { render } = require("consolidate").ejs;
const ora = require("ora");
let downLoadGit = require("download-git-repo");
downLoadGit = promisify(downLoadGit);
ncp = promisify(ncp);

render = promisify(render); // 包装渲染方法

// /Users/kong.ds/.template
const downloadDirectory = `${
  process.env[process.platform === "darwin" ? "HOME" : "USERPROFILE"]
}/.template`;
// 创建项目
// 1).获取仓库列表
const fetchRepoList = async () => {
  // 获取当前组织中的所有仓库信息,这个仓库中存放的都是项目模板
  const { data } = await axios.get(
    "https://api.github.com/orgs/chtty-cli/repos"
  );
  return data;
};

const fetchTagList = async (repo) => {
  const { data } = await axios.get(
    `https://api.github.com/repos/chtty-cli/${repo}/tags`
  );
  return data;
};

const download = async (repo, tag) => {
  let api = `chtty-cli/${repo}`; // 下载项目
  if (tag) {
    api += `#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`; // 将模板下载到对应的目录中
  console.log(dest);
  await downLoadGit(api, dest);
  return dest; // 返回下载目录
};

async function renderAsk(target, projectName) {
  console.log(target, projectName);
  // 没有ask文件说明不需要编译
  if (!fs.existsSync(path.join(target, "ask.js"))) {
    // 将下载的文件拷贝到当前执行命令的目录下
    await ncp(target, path.join(path.resolve(), projectName));
  } else {
    await new Promise((resovle, reject) => {
      MetalSmith(__dirname)
        .source(target) // 遍历下载的目录
        .destination(path.join(path.resolve(), projectName)) // 输出渲染后的结果
        .use(async (files, metal, done) => {
          // 弹框询问用户
          const result = await inquirer.prompt(
            require(path.join(target, "ask.js"))
          );
          const data = metal.metadata();
          Object.assign(data, result); // 将询问的结果放到metadata中保证在下一个中间件中可以获取到
          delete files["ask.js"];
          done();
        })
        .use((files, metal, done) => {
          Reflect.ownKeys(files).forEach(async (file) => {
            let content = files[file].contents.toString(); // 获取文件中的内容
            if (file.includes(".js") || file.includes(".json")) {
              // 如果是js或者json才有可能是模板
              if (content.includes("<%")) {
                // 文件中用<% 我才需要编译
                content = await render(content, metal.metadata()); // 用数据渲染模板
                files[file].contents = Buffer.from(content); // 渲染好的结果替换即可
              }
            }
          });
          done();
        })
        .build((err) => {
          // 执行中间件
          if (!err) {
            resovle();
          } else {
            reject();
          }
        });
    });
  }
}
module.exports = async (projectName) => {
  let spinner = ora("fetching repo list");
  spinner.start(); // 开始loading
  let repos = await fetchRepoList();
  spinner.succeed(); // 结束loading

  // 选择模板
  repos = repos.map((item) => item.name);
  const { repo } = await inquirer.prompt({
    name: "repo",
    type: "list",
    message: "please choice repo template to create project",
    choices: repos, // 选择模式
  });
  console.log(repo);

  // 获取版本信息
  spinner = ora("fetching repo tags");
  spinner.start();
  let tags = await fetchTagList(repo);
  spinner.succeed(); // 结束loading

  // 选择版本
  tags = tags.map((item) => item.name);
  const { tag } = await inquirer.prompt({
    name: "tag",
    type: "list",
    message: "please choice repo template to create project",
    choices: tags,
  });

  // down模版
  spinner = ora("download template");
  spinner.start(); // 开始loading
  const target = await download(repo, tag);
  spinner.succeed(); // 结束loading

  await renderAsk(target, projectName);
};
