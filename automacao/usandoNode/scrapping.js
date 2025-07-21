const puppeteer = require("puppeteer");
const { default: auth } = require("./auth");

const seletorEstadoMap = {
	AC: "div.item-submenu-header:nth-child(1) > div:nth-child(1) > div:nth-child(1)",
	AL: "div.item-submenu-header:nth-child(2) > div:nth-child(1) > div:nth-child(1)",
	AP: "div.item-submenu-header:nth-child(3) > div:nth-child(1) > div:nth-child(1)",
	AM: "div.item-submenu-header:nth-child(4) > div:nth-child(1) > div:nth-child(1) ",
	BA: "div.item-submenu-header:nth-child(5) > div:nth-child(1) > div:nth-child(1) ",
	CE: "div.item-submenu-header:nth-child(6) > div:nth-child(1) > div:nth-child(1) ",
	DF: "div.item-submenu-header:nth-child(7) > div:nth-child(1) > div:nth-child(1) ",
	ES: "div.item-submenu-header:nth-child(8) > div:nth-child(1) > div:nth-child(1) ",
	GO: "div.item-submenu-header:nth-child(9) > div:nth-child(1) > div:nth-child(1) ",
	MA: "div.item-submenu-header:nth-child(10) > div:nth-child(1) > div:nth-child(1) ",
	MT: "div.item-submenu-header:nth-child(11) > div:nth-child(1) > div:nth-child(1) ",
	MS: "div.item-submenu-header:nth-child(12) > div:nth-child(1) > div:nth-child(1) ",
	MG: "div.item-submenu-header:nth-child(13) > div:nth-child(1) > div:nth-child(1) ",
	PA: "div.item-submenu-header:nth-child(14) > div:nth-child(1) > div:nth-child(1) ",
	PB: "div.item-submenu-header:nth-child(15) > div:nth-child(1) > div:nth-child(1) ",
	PR: "div.item-submenu-header:nth-child(16) > div:nth-child(1) > div:nth-child(1) ",
	PE: "div.item-submenu-header:nth-child(17) > div:nth-child(1) > div:nth-child(1) ",
	PI: "div.item-submenu-header:nth-child(18) > div:nth-child(1) > div:nth-child(1) ",
	RJ: "div.item-submenu-header:nth-child(19) > div:nth-child(1) > div:nth-child(1) ",
	RN: "div.item-submenu-header:nth-child(20) > div:nth-child(1) > div:nth-child(1) ",
	RS: "div.item-submenu-header:nth-child(21) > div:nth-child(1) > div:nth-child(1) ",
	RO: "div.item-submenu-header:nth-child(22) > div:nth-child(1) > div:nth-child(1) ",
	RR: "div.item-submenu-header:nth-child(23) > div:nth-child(1) > div:nth-child(1) ",
	SC: "div.item-submenu-header:nth-child(24) > div:nth-child(1) > div:nth-child(1) ",
	SP: "div.item-submenu-header:nth-child(25) > div:nth-child(1) > div:nth-child(1) ",
	SE: "div.item-submenu-header:nth-child(26) > div:nth-child(1) > div:nth-child(1) ",
	TO: "div.item-submenu-header:nth-child(27) > div:nth-child(1) > div:nth-child(1) ",
};
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
		await page.type("#Email", auth.login.email);
		await page.type("#Senha", auth.login.senha);
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

async function filtrarEExtrairLista(page, json) {
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
		await page.click("div.item:nth-child(4) > p:nth-child(1)");
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log("Painel de filtros aberto.");

		console.log("Aplicando a estratégia de filtro...");
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
		console.log("Ativando filtro 'Empresa Economicamente Ativa: Sim'...");
		await page.waitForSelector("#EMPRESA_ECO_ATIVA", { timeout: 10000 });
		await new Promise((resolve) => setTimeout(resolve, 20000));
		await page.click(
			"div.filtro-lateral-conteudo:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
		);
		console.log("Ativando filtro telefone");
		await page.waitForSelector("#FLMOVEL", { timeout: 10000 });
		await page.click(
			"div.filtro-lateral-conteudo:nth-child(8) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1)"
		);
		const prospectarSelectorVariavel = "a[href='/empresa/index']";
		await page.waitForSelector(prospectarSelectorVariavel, {
			visible: true,
		});
		await page.click(prospectarSelectorVariavel);

		await page.click("div.item:nth-child(5) > p:nth-child(1)");
		await new Promise((resolve) => setTimeout(resolve, 2000));
		await page.click("div.item:nth-child(5) > p:nth-child(1)");
		await new Promise((resolve) => setTimeout(resolve, 5000));
		await page.click(
			"div.col-md-3:nth-child(2) > div:nth-child(1) > div:nth-child(1)"
		);
		await new Promise((resolve) => setTimeout(resolve, 2000));

		await selecionarOpcaoSelect2(
			page,
			"#linha-cnae-primario",
			json.CNAEPRIMARIO
		);

		await new Promise((resolve) => setTimeout(resolve, 10000));
		await page.click("div.item:nth-child(7) > p:nth-child(1)");
		await page.waitForSelector("#tab-localidade", { visible: false });
		await new Promise((resolve) => setTimeout(resolve, 5000));
		await page.click(".text-right");

		await new Promise((resolve) => setTimeout(resolve, 7000));
		console.log("Selecionando estado e cidade...");

		await page.click(seletorEstadoMap[json.ESTADO]);
		await new Promise((resolve) => setTimeout(resolve, 5000));

		await page.click(`.abrir-cidades-${json.ESTADO}`);
		await new Promise((resolve) => setTimeout(resolve, 30000));
		await page.type(".campo-localidade", json.CIDADE);
		await new Promise((resolve) => setTimeout(resolve, 30000));

		await page.click(
			`#retorno-busca-localidade-pj-${json.ESTADO} > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)`
		);
		await new Promise((resolve) => setTimeout(resolve, 7000));
		await page.click(
			"#modalFiltroLocalizacaoPJ > div:nth-child(1) > button:nth-child(1)"
		);
		await page.click(".botoes-acoes > button:nth-child(2)");
		console.log("Salvando a lista...");
		const inputTituloSelector = "#titulo-lista-extracao-novo";
		await page.waitForSelector(inputTituloSelector, {
			visible: true,
			timeout: 60000,
		}); // 60 segundos
		await page.type(inputTituloSelector, json.NOMEDALISTA);

		await page.waitForSelector("#btn-salvar-lista", { visible: true });
		await page.evaluate(() => {
			const loader = document.querySelector(
				"#btn-salvar-lista-status-salvando"
			);
			if (loader && getComputedStyle(loader).display !== "none") return;

			const btn = document.querySelector("#btn-salvar-lista");
			if (btn) btn.click();
		});

		console.log("Lista salva. Aguardando processamento...");
		await Promise((resolve) => setTimeout(10000));

		console.log(
			"Processo de filtragem e salvamento concluído com sucesso!"
		);
		return [{ status: "Lista criada com sucesso" }];
	} catch (error) {
		console.error("Erro ao filtrar e extrair a lista:", error);
		return null;
	}
}
/***
 * Digita em um campo de busca Select2, aguarda o resultado e clica na opção correspondente.
 * @param {import('puppeteer').Page} page - A instância da página do Puppeteer.
 * @param {string} seletorContainer - Um seletor CSS para o contêiner principal do campo.
 * @param {string | number} termoBusca - O texto ou NÚMERO a ser digitado e selecionado.
 */
async function selecionarOpcaoSelect2(page, seletorContainer, termoBusca) {
	const termoBuscaString = String(termoBusca);

	try {
		console.log(
			`Buscando o campo Select2 dentro de '${seletorContainer}'...`
		);
		const seletorInput = `${seletorContainer} .select2-search__field`;

		await page.type(seletorInput, termoBuscaString, { delay: 100 });
		console.log(`Termo '${termoBuscaString}' digitado.`);

		const seletorResultadoXPath = `//li[contains(@class, 'select2-results__option') and contains(., '${termoBuscaString}')]`;

	
		const seletorXPathCompleto = `xpath/${seletorResultadoXPath}`;

		console.log("Aguardando o resultado da busca aparecer...");
		await page.waitForSelector(seletorXPathCompleto, {
			visible: true,
			timeout: 10000,
		});

		console.log("Clicando diretamente no resultado encontrado...");
		
		await page.click(seletorXPathCompleto);

		console.log(`Opção '${termoBuscaString}' selecionada com sucesso.`);
	} catch (error) {
		console.error(
			`Erro ao selecionar a opção '${termoBuscaString}' no Select2:`,
			error
		);
		throw error;
	}
}

/**
 * Função principal que orquestra todo o processo.
 */
async function gerarLista(json) {
	const loginInfo = await realizarLogin();
	if (loginInfo) {
		
		const dadosExtraidos = await filtrarEExtrairLista(loginInfo.page, json);

		if (dadosExtraidos) {
			return true;
		} else {
			console.log("Nenhum dado foi extraído, fechando o navegador.");
			await loginInfo.browser.close();
			return false;
		}
	}
}

module.exports = { gerarLista };
