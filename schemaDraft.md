```
User Object
{
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  created: { type: Date, default: Date.now, required: true },
  updated: { type: Date, default: Date.now, required: true },
  permission: { type: Number, required: true }, //0: admin, 1: staff, 2: user (more roles can be added in the future)
}

WebsiteForm Object
{
    username: { type: String, required: true }, //username for accessing our portal
    companyName: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    primaryContactName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    socials: [String],
    branding: {
        files: [String], //array of media urls
        colorCodes: {
            type: [String],
            validate: {
            validator: function(v) {
                return v.every(hexColorValidator); //const hexColorValidator = (v) => /^#(?:\[0-9a-fA-F\]{3}){1,2}$/.test(v);
            },
            message: props => `${props.value} contains invalid hexadecimal color code`
            }
        },
        fonts: [String],
        designDocument:[String], //array of media urls
    },
    hosting: {
        type:{
            proivider: { type: String, required: true },
            username: { type: String, required: true },
            password: { type: String, required: true },
        },
        required: false
    },
    FTP: {
        type:{
            host: { type: String, required: true },
            username: { type: String, required: true },
            password: { type: String, required: true },
            liveDirectory: { type: String, required: true }
        },
        required: false
    },
    controlPanel: {
        type: {
            url: { type: String, required: true },
            username: { type: String, required: true },
            password: { type: String, required: true }
        },
        required: false
    },
    domain: {
        type: {
            provider: { type: String, required: true },
            username: { type: String, required: true },
            password: { type: String, required: true }
        },
        required: false
    },
    budget: { type: Number, required: true },
    SEOKeywords: [String],
    legalDocuments: [String], //urls
    comments: String //anything additional
}

BotConfigForm Object
{
    name: { type: String, required: true },
    avatar: { type: String, required: true }, //icon url
    greetingMessage: String,
    model: String,
    training: {
        files: [String] //file url
        urls: [String]
        pinecone: { //or are we making the pinecone DB for them?
            type: {
                url: { type: String, required: true },
                APIKey: { type: String, required: true },
            },
            required: false
        }
        basePrompt: String,
        restrictions: String,
    }
}
```
