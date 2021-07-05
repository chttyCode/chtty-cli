const program = require("commander");
const path = require("path");

const { version } = require("./utils/constants");

const actionsMap = {
  create: {
    // 创建模板
    description: "create project",
    alias: "cr",
    examples: ["chtty create <template-name>"],
  },
  config: {
    // 配置配置文件
    description: "config info",
    alias: "c",
    examples: ["chtty config get <k>", "chtty config set <k> <v>"],
  },
};
// 循环创建命令
Object.keys(actionsMap).forEach((action) => {
  program
    .command(action) // 命令的名称
    .alias(actionsMap[action].alias) // 命令的别名
    .description(actionsMap[action].description) // 命令的描述
    .action(() => {
      // 动作
      require(path.resolve(__dirname, action))(...process.argv.slice(3));
    });
});

program.on("--help", () => {
  console.log("Examples");
  Object.keys(actionsMap).forEach((action) => {
    (actionsMap[action].examples || []).forEach((example) => {
      console.log(`  ${example}`);
    });
  });
});

program.version(version).parse(process.argv);
