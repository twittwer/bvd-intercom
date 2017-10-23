# load-generator

> Load generator for bvd-intercom (POST over https)

## Sample
`node index.js 1500 temperature=temperature,counter=counter,news=text`

## Usage
`node index.js <interval> <loadGenerationString> [limit]`

| Param                | Sample                                      | Description                                            |
| -------------------- | ------------------------------------------- | ------------------------------------------------------ |
| interval             | `2000`                                      | pause interval between load distributions              |
| loadGenerationString | `counter,temperature=temperature,news=text` | definition of distributed load (`channel[=generator]`) |
| limit                | `50`                                        | limitation of distribution cycles (default: unlimited) |

#### Generators
- counter (default): simple integer increased by every distribution cycle
- temperature: dummy temperature string like '18°C'
- text: lorem ipsum text based on text generator of casual module

#### Environment Variables
The environment variables `RECEIVER_HOST`, `RECEIVER_PORT`, `RECEIVER_PATH` can be used to customize the load target.  
Default Destination: `https://localhost:8080/receiver/api`
