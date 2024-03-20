export default {
  currentEditOne: null,
  currentEditStatus: 'Success',
  schemaUpdateTime: Date.now(),
  surveyId: '', // url上取的surveyId
  schema: {
    metaData: null,
    bannerConf: {
      titleConfig: {
        mainTitle: '<h3 style="text-align: center">欢迎填写问卷</h3>',
        subTitle: `<p>为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，<span style="color: rgb(204, 0, 0)">期待您的参与！</span></p>`,
        applyTitle: '',
      },
      bannerConfig: {
        bgImage: '',
        bgImageAllowJump: false,
        bgImageJumpLink: '',
        videoLink: '',
        postImg: '',
      },
    },
    bottomConf: {
      logoImage: '',
      logoImageWidth: '28%',
    },
    skinConf: {
      bannerConf: {
        bgImage: "/imgs/skin/17e06b7604a007e1d3e1453b9ddadc3c.webp",
        videoLink: "",
        postImg: ""
      },
      backgroundConf: {
        color: "#fff"
      },
      themeConf: {
        color: "#ffa600"
      },
      contentConf: {
        opacity: 100
      },
      logoConf: {
        logoImage: "/imgs/Logo.webp",
        logoImageWidth: "60%"
      }
    },
    baseConf: {
      begTime: '',
      endTime: '',
      language: 'chinese',
      showVoteProcess: 'allow',
      tLimit: 0,
      answerBegTime: '',
      answerEndTime: '',
      answerLimitTime: 0,
    },
    submitConf: {
      submitTitle: '',
      msgContent: {},
      confirmAgain: {
        is_again: true,
      },
      link: '',
    },
    questionDataList: [],
  },
};
