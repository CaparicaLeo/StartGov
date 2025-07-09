const puppeteer = require('puppeteer');
const axios = require('axios');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://next.novavidati.com.br/login/index', { waitUntil: 'networkidle2' });

    await page.type('#Email', 'donne.santos@bettegacob.com.br');
    await page.type('#Senha', 'Ennody0604!');
    await page.click('#btnEntrarLogin');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const modalFechar = await page.$('#modalLogin a.close-modal');
    if (modalFechar) {
      console.log('Modal detectado, fechando...');
      await modalFechar.click();

      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.click('#btnEntrarLogin');
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const urlAtual = page.url();
    console.log('Login concluído!');
    console.log('URL atual:', urlAtual);

    //webhook do n8n
    const webhookUrl = 'https://n8n.monitoramentogovernize.tech/webhook-test/dados-login';

    await axios.post(webhookUrl, {
      mensagem: 'Login concluído com sucesso!',
      urlAtual: urlAtual,
      email: 'donne.santos@bettegacob.com.br'
    });

    console.log('Dados enviados para o n8n com sucesso!');

  } catch (err) {
    console.error('Erro durante o processo:', err.message);
  } finally {
    await browser.close();
  }
})();
