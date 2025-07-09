const puppeteer = require("puppeteer");
const axios = require("axios");

async function enviarWebHook(urlAtual, browser) {
	try {
		console.log("URL atual:", urlAtual);

		const webhookUrl =
			"https://n8n.monitoramentogovernize.tech/webhook-test/dados-login";

		await axios.post(webhookUrl, {
			mensagem: "Login concluído com sucesso!",
			urlAtual: urlAtual,
			email: "donne.santos@bettegacob.com.br",
		});

		console.log("Dados enviados para o n8n com sucesso!");
	} catch (err) {
		console.error("Erro ao enviar webhook:", err.message);
	} finally {
		await browser.close();
	}
}

async function realizarLogin() {
	const browser = await puppeteer.launch({
		headless: false,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	const page = await browser.newPage();

	try {
		await page.goto("https://next.novavidati.com.br/login/index", {
			waitUntil: "networkidle2",
		});

		await page.type("#Email", "donne.santos@bettegacob.com.br");
		await page.type("#Senha", "Ennody0604!");
		await page.click("#btnEntrarLogin");

		// Espera 2 segundos
		await new Promise((resolve) => setTimeout(resolve, 2000));

		const modalFechar = await page.$("#modalLogin a.close-modal");
		if (modalFechar) {
			console.log("Modal detectado, fechando...");
			await modalFechar.click();

			await new Promise((resolve) => setTimeout(resolve, 1000));
			await page.click("#btnEntrarLogin");
		}

		await page.waitForNavigation({ waitUntil: "networkidle2" });

		const urlAtual = await page.url();
		console.log("Login concluído!");

		return { urlAtual, browser };
	} catch (error) {
		console.error("Erro durante o login:", error.message);
		await browser.close();
	}
}

async function extrairLista(browser) {
  
}


(async () => {
	const resultado = await realizarLogin();

	if (resultado) {
		await enviarWebHook(resultado.urlAtual, resultado.browser);
	}
})();
