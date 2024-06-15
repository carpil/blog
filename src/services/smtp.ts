import { Resend } from 'resend'

const resend = new Resend(import.meta.env.RESEND_API_KEY)

export const addContact = async ({ name, email }: {
  name: string, email: string
}) => {
  const response = await resend.contacts.create({
    email: email,
    firstName: name.split(' ')[0],
    lastName: name.split(' ')[1] || '',
    unsubscribed: false,
    audienceId: import.meta.env.GENERAL_AUDIENCE_ID,
  })
  return response
}

export const sendWelcomeEmail = async ({ name, email }: {
  name: string,
  email: string
}) => {
  const firstName = name.split(' ')[0]
  const response = await resend.emails.send({
    from: 'Rodolfo Rojas <rodolfo@carpil.app>',
    to: [email],
    subject: '[CARPIL] ⚙️ Conociendo Carpil desde dentro ⚙️',
    html: `
      <html dir="ltr" lang="es">
      <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta content="width=device-width" name="viewport" />
        <meta content="IE=edge" http-equiv="X-UA-Compatible" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
        <meta content="light" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />
      </head>

      <body
        style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:1.0769230769230769em;min-height:100%;line-height:155%">
        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
          style="align:center;padding-left:20px;padding-right:20px;h-padding:20px;width:auto;max-width:600px;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif">
          <tbody>
            <tr>
              <td>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <span>Hola ${firstName}</span>
                </p>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <span>Si te llegó este correo es porque quieres conocer más de la aplicación que estoy construyendo y eso me
                    alegra un montón. 🥺</span>
                </p>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <span>Y quiero decirte que ahora tú también formas parte de esta aplicación. Me ayudarás aportando ideas,
                    toma de decisiones, te mantendré al tanto de lo que voy desarrollando y próximo a salir. Y por
                    supuesto, </span><span><strong>serás una de las primeras personas en utilizar la
                      aplicación.</strong></span><span> 🚀</span>
                </p>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <span>Mi objetivo siempre ha sido transmitir como se van creando las cosas que vemos en las webs y
                    aplicaciones. No que se vean por arte de magia. 🪄</span>
                </p>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <span>${firstName}, te mantengo informado(a).🫡</span></p>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <span>Pura vida🇨🇷,</span>
                </p>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <br /><span>-Rodolfo Rojas</span>
                </p>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                  <span>-CEO de Carpil (⬅️ &quot;fake it until you make it 🚀&quot;)</span>
                </p><br />
                <hr class="divider"
                  style="width:100%;border:none;border-top:1px solid #eaeaea;padding-bottom:1em;border-width:2px" />
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                  <tbody>
                    <tr>
                      <td>
                        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                          <tbody style="width:100%">
                            <tr style="width:100%">
                              <td data-id="__react-email-column"></td>
                              <td align="center" data-id="__react-email-column"
                                style="padding-right:8px;width:32px;box-sizing:content-box"><a
                                  href="https://www.instagram.com/jrodolforojas/" rel="noopener noreferrer"
                                  target="_blank"><img height="32" src="https://resend.com/static/email/social-instagram.png"
                                    style="display:block;outline:none;border:none;text-decoration:none" width="32" /></a></td>
                              <td align="center" data-id="__react-email-column"
                                style="padding-right:8px;width:32px;box-sizing:content-box"><a
                                  href="https://www.youtube.com/channel/UCoDtnpxnF6Im9YXyBJd5I1Q" rel="noopener noreferrer"
                                  target="_blank"><img height="32" src="https://resend.com/static/email/social-youtube.png"
                                    style="display:block;outline:none;border:none;text-decoration:none" width="32" /></a></td>
                              <td data-id="__react-email-column"></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                  <tbody>
                    <tr>
                      <td>
                        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                          <tbody style="width:100%">
                            <tr style="width:100%">
                              <td data-id="__react-email-column"></td>
                              <td data-id="__react-email-column"></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table align="center" width="100%" class="footer" border="0" cellPadding="0" cellSpacing="0"
                  role="presentation" style="font-size:0.8em">
                  <tbody>
                    <tr>
                      <td><br />
                        <hr class="divider"
                          style="width:100%;border:none;border-top:1px solid #eaeaea;padding-bottom:1em;border-width:2px" />
                        <p class=""
                          style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                          <span>You are receiving this email because you opted in via our site.</span><br /><span>Want to
                            change how you receive these emails?</span><br /><span>You can </span><span><a
                              href="https://unsubscribe.resend.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb250YWN0SWQiOiJmMTA5MmYyMy1iNDUzLTRlNGQtODZlMi1hMDE5ZGQ0MzVlNTYiLCJhdWRpZW5jZUlkIjoiZDViY2ExNTAtNTZiNS00ZWU3LWExMjItMmM2Nzk2OWNjMWNjIiwiYnJvYWRjYXN0SWQiOiJlZWVlMmFiYi1kMzZhLTQwZTItYjIyNC0zMWVjMTIwZDE4MzIiLCJ0ZWFtSWQiOiI3NzhmZmMyNC00Yzc2LTQxYWEtOThmZC1jMThjODI3MjA2MWQiLCJpYXQiOjE3MTg0NzcwOTcsImV4cCI6MTcyMTA2OTA5N30.Xoa2SWEJw7Ro42Twkv5ol9NonTL3xLmLfwRrPeWMDs4"
                              rel="noopener noreferrer nofollow"
                              style="color:#5107db;text-decoration:underline;text-decoration:underline;font-weight:400"
                              target="_blank">unsubscribe from this list</a></span><span>.</span>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p class="" style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>

      </html>
    `
  })
  return response
}