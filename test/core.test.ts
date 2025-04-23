import { expect, it } from 'vitest'
import { getDirpyLink } from '../src/core/dirpy'

it('get Dirpy link', async () => {
  const link = await getDirpyLink({
    url: 'https://www.youtube.com/watch?v=SAXpBgkXt60'
  })

  expect(link).toBe(
    'https://rr5---sn-a5meknd6.googlevideo.com/videoplayback?expire=1743153923&ei=oxbmZ634HZujzN0Pqqn_0As&ip=108.181.96.190&id=o-AClQWhdNOtrzCngcp7ZQYLkLq0JkeCghWWLn5DU5v0I0&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1743132323%2C&mh=Mr&mm=31%2C29&mn=sn-a5meknd6%2Csn-q4flrnes&ms=au%2Crdu&mv=m&mvi=5&pl=26&rms=au%2Cau&initcwndbps=1557500&siu=1&bui=AccgBcNvinLDr01IbhVzdER-oLyyFIjXOkA0jba3ABDThtOsP6zw1j6Zl7zlkOGPD2NbHMG5Rw&vprv=1&svpuc=1&mime=video%2Fmp4&ns=A4SOSCmV9jqkQKEXqFFOdQMQ&rqh=1&gir=yes&clen=19407840&ratebypass=yes&dur=240.071&lmt=1725676631712940&mt=1743131843&fvip=2&lmw=1&c=TVHTML5&sefc=1&txp=1538434&n=0wpibB8iEIv9iw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Csiu%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AFVRHeAwRQIhAMEzbh05UXJg4wkOVgiJLRd5sh6HYaLmyhlXk0sZyvQpAiBk8XYYnw8sCT-3plFcqXcvAZA_qb2Ckmp6ZBjAqdM6Fw%3D%3D&sig=AJfQdSswRQIhAJ70WlKQvrnKjRuvwAhRGpoecwZ9VBFzg13gTDD8GzZIAiBMfGINSCQD7p--aKff9NMIbYlCX1OWl3h931u6wLXHog%3D%3D&pot=Ml8V31qakSVyfBXjnIRKjBiQCp6a0em-hCRSfhuH18CI8P3khK2c2mW0RqktU9bW2o0a_dJw5jExhdvIABHN5BYhpMxsFZMFhoitQt7HIU00RQhVyoX1lDgWrCg8mZAnHQ%3D%3D',
  )
})