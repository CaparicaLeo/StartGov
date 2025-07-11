const puppeteer = require("puppeteer");
const axios = require("axios");

/**
 * Função final: Envia os dados para o webhook e fecha o navegador.
 * @param {object} dados - Os dados extraídos para enviar no webhook.
 * @param {import('puppeteer').Browser} browser - A instância do navegador para fechar.
 */
async function enviarWebHook(dados, browser) {
	try {
		const webhookUrl =
			"https://n8n.monitoramentogovernize.tech/webhook-test/dados-login";

		console.log("Enviando dados para o n8n...");
		await axios.post(webhookUrl, {
			status: "Sucesso",
			quantidadeResultados: dados.length,
			resultados: dados,
			emailUsado: "donne.santos@bettegacob.com.br",
		});

		console.log("Dados enviados para o n8n com sucesso!");
	} catch (err) {
		console.error("Erro ao enviar webhook:", err.message);
	} finally {
		console.log("Fechando o navegador.");
		await browser.close();
	}
}

/**
 * Realiza o login na plataforma Novavidati.
 * @returns {Promise<{browser: import('puppeteer').Browser, page: import('puppeteer').Page}|null>}
 */
async function realizarLogin() {
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: false,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--start-maximized",
			],
			defaultViewport: null,
		});

		const page = await browser.newPage();

		console.log("Navegando para a página de login...");
		await page.goto("https://next.novavidati.com.br/login/index", {
			waitUntil: "networkidle2",
		});

		console.log("Preenchendo credenciais...");
		await page.type("#Email", "donne.santos@bettegacob.com.br");
		await page.type("#Senha", "Ennody0604!");
		await page.click("#btnEntrarLogin");

		try {
			await page.waitForSelector("#modalLogin a.close-modal", {
				timeout: 3000,
			});
			console.log("Modal detectado, fechando...");
			await page.click("#modalLogin a.close-modal");
			await new Promise((resolve) => setTimeout(resolve, 1000));
			await page.click("#btnEntrarLogin");
		} catch (e) {
			console.log("Nenhum modal de login detectado, continuando...");
		}

		console.log("Aguardando navegação após o login...");
		await page.waitForNavigation({ waitUntil: "networkidle2" });
		console.log("Login concluído com sucesso!");

		return { browser, page };
	} catch (error) {
		console.error("Erro fatal durante o login:", error.message);
		if (browser) await browser.close();
		return null;
	}
}

/**
 * Navega, aplica os filtros e extrai a lista de resultados.
 * @param {import('puppeteer').Page} page - A página já logada.
 * @returns {Promise<object[]|null>} - Uma lista de resultados ou nulo em caso de erro.
 */

// As funções enviarWebHook e realizarLogin continuam as mesmas da última versão.

async function filtrarEExtrairLista(page) {
	try {
		console.log("Acessando a área de prospecção...");
		const prospectarSelector = "a[href='/empresa/index']";
		await page.waitForSelector(prospectarSelector, { visible: true });
		await page.click(prospectarSelector);

		const seletorBotaoLimpar = "#btn-limpar-filtros-pj";
		await page.waitForSelector(seletorBotaoLimpar, { visible: true });
		console.log("Página de prospecção carregada, botão 'Limpar' visível.");

		await page.click(seletorBotaoLimpar);
		console.log("Filtros limpos.");
		await new Promise((resolve) => setTimeout(resolve, 1000));

		console.log("Abrindo painel de filtros...");
		await page.click("div.item:nth-child(4) > p:nth-child(1)");
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log("Painel de filtros aberto.");

		console.log("Aplicando a estratégia de filtro...");
		// Este XPath procura por um botão DENTRO do modal que contenha o texto "Filtrar".
		// Se o texto for "Aplicar", basta trocar a palavra.
		await page.select(
			"#filtroPJEstrategia > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > select:nth-child(1)",
			"MICRO"
		);
		await page.select(
			"#filtroPJEstrategia > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > select:nth-child(1)",
			"PEQUENA"
		);
		await page.select(
			"#filtroPJEstrategia > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > select:nth-child(1)",
			"MÉDIA"
		);

		// Espera o switcher estar visível
		await page.waitForSelector(
			"div.form-check.form-check-inline .ui-switcher",
			{ visible: true }
		);

		// Clica nele
		await page.click("div.form-check.form-check-inline .ui-switcher");

		const FLMovel = await page.$("#FLMOVEL");
		await FLMovel.evaluate((e) => e.scrollIntoView());
		await FLMovel.click();

		console.log("Salvando a lista...");
		const inputTituloSelector = "#titulo-lista-extracao-novo";
		await page.waitForSelector(inputTituloSelector, {
			visible: true,
			timeout: 60000,
		}); // 60 segundos
		await page.type(inputTituloSelector, "Lista de Teste Automatizada");

		await page.click(
			"#modalFiltroPJEstrategia > div:nth-child(1) > div:nth-child(4) > div:nth-child(11) > button:nth-child(1)"
		);
		console.log("Lista salva. Aguardando processamento...");
		await page.waitForNavigation({ waitUntil: "domcontentloaded" });

		console.log(
			"Processo de filtragem e salvamento concluído com sucesso!"
		);
		return [{ status: "Lista criada com sucesso" }];
	} catch (error) {
		console.error("Erro ao filtrar e extrair a lista:", error);
		return null;
	}
}

/**
 * Função principal que orquestra todo o processo.
 */
(async () => {
	// Passo 1: Fazer Login
	const loginInfo = await realizarLogin();

	if (loginInfo) {
		// Passo 2: Filtrar e Extrair os Dados
		const dadosExtraidos = await filtrarEExtrairLista(loginInfo.page);

		// Passo 3: Enviar o Webhook com os dados e fechar
		if (dadosExtraidos) {
			await enviarWebHook(dadosExtraidos, loginInfo.browser);
		} else {
			console.log("Nenhum dado foi extraído, fechando o navegador.");
			await loginInfo.browser.close();
		}
	}
})();
