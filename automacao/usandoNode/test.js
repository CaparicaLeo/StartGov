const {gerarLista} = require('./scrapping');

const json = {
	CNAEPRIMARIO: "43304",
	ESTADO: "MG",
	CIDADE: "BELO HORIZONTE",
	NOMEDALISTA: "PERSIANAS - BH",
};

(async () => {
	try {
		const resultado = await gerarLista(json);
		console.log("Resultado:", resultado);
	} catch (error) {
		console.error("Erro ao gerar lista:", error);
	}
})();
