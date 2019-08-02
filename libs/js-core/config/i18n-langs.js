// we follow the https://tools.ietf.org/html/rfc5645, define lang file in kerbab case
// in future, accept langs can be passed from CLI argument
const Langs = ['en', 'zh-cn'];

// define the lang key name mapping, because backend will define another key
// which not use the string defined in Langs.
const LangsMap = {
  en_US: 'en',
  zh_CN: 'zh-cn'
};

module.exports = { Langs, LangsMap };
