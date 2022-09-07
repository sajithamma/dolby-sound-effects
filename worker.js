const fs = require('fs');
const axios = require('axios').default;

const APP_KEY = 'ENTER_YOUR_APP_KEY_HERE';
const APP_SECRET = 'ENTER_YOUR_APP_SECRET_HERE';


let input_path;
let output_path;

const get_access = async (callback) => {


    const dolbyio = require('@dolbyio/dolbyio-rest-apis-client');

    const at = await dolbyio.authentication.getApiAccessToken(APP_KEY, APP_SECRET);

    //console.log(`Access Token: ${at.access_token}`);

    console.log('Authenticated...');

    callback(at.access_token);


}



const upload = (api_token, callback) => {

    console.log('Uploading ' + input_path);

    const config = {
        method: 'post',
        url: 'https://api.dolby.com/media/input',
        headers: {
            "Authorization": `Bearer ${api_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        data: {
            url: 'dlb://example/volcano.mp4'
        }
    };



    axios(config)
        .then(function (response) {
            const upload_config = {
                method: 'put',
                url: response.data.url,
                data: fs.createReadStream(input_path),
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': fs.statSync(input_path).size
                }
            };
            axios(upload_config)
                .then(function () {
                    console.log("File uploaded: ", "dlb://example/volcano.mp4 (todo)");
                    callback();
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
        .catch(function (error) {
            console.log(error);
        });


}


const process = (api_token, callback) => {

    let content_types = ["conference", "interview", "lecture", "meeting", "mobile_phone", "music", "podcast", "studio", "voice_over"]

    const config = {
        method: "post",
        url: "https://api.dolby.com/media/enhance",
        "headers": {
            "Authorization": `Bearer ${api_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        data: {
            input: "dlb://example/volcano.mp4",
            output: "dlb://out/volcano.mp4",
            content: { type: "music" },
            audio: {
                noise: { reduction: { amount: "max" } },
                filter: { hum: { enable: true } },
                speech: { isolation: { enable: true, amount: 70 } }
            }
        },
    }

    axios(config)
        .then(function (response) {

            console.log('Added to the enhancing queue with job id: ' + response.data.job_id);

            callback(response.data.job_id);
        })
        .catch(function (error) {
            console.log('Error in uploading');
            console.log(error)
        })

}

const status = (api_token, job_id, callback) => {

    const config = {
        method: "get",
        url: "https://api.dolby.com/media/enhance",
        "headers": {
            "Authorization": `Bearer ${api_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },

        //TODO: You must replace this value with the job ID returned from the previous step.

        params: {
            job_id: job_id,
        },
    }

    axios(config)
        .then(function (response) {

            //console.log(JSON.stringify(response.data, null, 4))

            callback(response.data);

        })
        .catch(function (error) {
            console.log(error)
        })
}




const process_response = (response, access_token, job_id) => {

    console.log(response.progress + '% completed');

    if (response.progress < 100) {

        console.log('rechecking in 3 seconds...');

        setTimeout(() => {
            status(access_token, job_id,

                (response) => {

                    process_response(response, access_token, job_id);

                }
            )
        }, 3000);


    }
    else {

        console.log('job completed');

        review_media(access_token);
    }
}


const review_media = (api_token) => {

    console.log('Downloading media...');

    const config = {
        method: "get",
        url: "https://api.dolby.com/media/output",
        headers: {
            "Authorization": `Bearer ${api_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        responseType: "stream",
        params: {
            url: "dlb://out/volcano.mp4",
        },
    }

    axios(config)
        .then(function (response) {
            response.data.pipe(fs.createWriteStream(output_path))
            response.data.on("error", function (error) {
                console.log(error)
            })
            response.data.on("end", function () {
                console.log("File downloaded to: " + output_path)
            })
        })
        .catch(function (error) {
            console.log(error)
        })

}


const dolbi_init = (infile, outfile) => {

    //Assign to global variables
    input_path = infile;
    output_path = outfile;


    get_access((access_token) => {


        upload(access_token, () => {


            process(access_token, (job_id) => {


                status(access_token, job_id, (response) => {

                    process_response(response, access_token, job_id);

                });

            });

        });


    });

}


dolbi_init('./volcano.mp4', './download.mp4');