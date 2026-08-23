// ELEMENTOS DEL FORMULARIO
const formLiquidacion = document.getElementById('form-liquidacion');
const selectSmmlv = document.getElementById('factor_smmlv');
const inputSalarioBase = document.getElementById('salario_base_input');
const inputVariables = document.getElementById('variables_input');
const inputAuxTransporte = document.getElementById('aux_transporte_input');
const divCampoRecibeAuxilio = document.getElementById('campo_recibe_auxilio');
const radiosRecibeAuxilio = document.getElementsByName('recibe_auxilio_radio');

const inputFechaInicio = document.getElementById('fecha_inicio');
const inputFechaFin = document.getElementById('fecha_fin');
const selectTipoContrato = document.getElementById('tipo_contrato');
const selectMotivoRetiro = document.getElementById('motivo_retiro');
const divCampoFechaPactada = document.getElementById('campo_fecha_pactada');
const inputFechaPactadaFin = document.getElementById('fecha_pactada_fin');

const divPrimaAnterior = document.getElementById('campo_prima_anterior');
const radiosPrima = document.getElementsByName('prima_pagada');

// ELEMENTOS DE VACACIONES
const radiosVacaciones = document.getElementsByName('vacaciones_disfrutadas');
const divDespliegueVacaciones = document.getElementById('despliegue_vacaciones');
const selectUnidadVacaciones = document.getElementById('unidad_vacaciones');
const selectCantidadVacaciones = document.getElementById('cantidad_vacaciones');

// BOTONES
const btnPdf = document.getElementById('btn-descargar-pdf');
const btnExcel = document.getElementById('btn-exportar-excel');
const btnImprimir = document.getElementById('btn-imprimir');
const btnLimpiar = document.getElementById('btn-limpiar');

// --- FUNCIONES UTILITARIAS DE FORMATEO ---
function formatearMonedaTexto(valor) {
    const numero = parseInt(String(valor).replace(/\D/g, ''), 10);
    if (isNaN(numero) || numero === 0) return '$ 0';
    return `$ ${numero.toLocaleString('es-CO')}`;
}

function desformatearMoneda(texto) {
    const num = parseInt(String(texto).replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
}

function aplicarMascaraMonedaEnInput(input) {
    const cursorPosition = input.selectionStart;
    const originalLength = input.value.length;
    const valorNumerico = desformatearMoneda(input.value);
    
    input.value = formatearMonedaTexto(valorNumerico);
    
    const newLength = input.value.length;
    const newPos = Math.max(0, cursorPosition + (newLength - originalLength));
    try { input.setSelectionRange(newPos, newPos); } catch (e) {}
}

function actualizarOpcionesCantidadVacaciones() {
    selectCantidadVacaciones.innerHTML = '';
    const unidad = selectUnidadVacaciones.value;

    if (unidad === 'dias') {
        for (let i = 1; i <= 120; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} ${i === 1 ? 'Día hábil' : 'Días hábiles'}`;
            selectCantidadVacaciones.appendChild(option);
        }
    } else if (unidad === 'semanas') {
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i;
            const diasHabilesEq = i * 6;
            option.textContent = `${i} ${i === 1 ? 'Semana' : 'Semanas'} (~${diasHabilesEq} días hab.)`;
            selectCantidadVacaciones.appendChild(option);
        }
    } else if (unidad === 'periodos') {
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            const diasHabilesEq = i * 15;
            option.textContent = `${i} ${i === 1 ? 'Período / Año' : 'Períodos / Años'} (${diasHabilesEq} días hab.)`;
            selectCantidadVacaciones.appendChild(option);
        }
    }
}

function obtenerAnioFechaFin() {
    const f = new Date(inputFechaFin.value + 'T00:00:00');
    return isNaN(f.getFullYear()) ? 2026 : f.getFullYear();
}

function manejarCambioSmmlv() {
    const val = selectSmmlv.value;
    if (val === 'otro') {
        inputSalarioBase.disabled = false;
        inputSalarioBase.classList.remove('bg-gray-800', 'cursor-not-allowed', 'text-gray-400');
        inputSalarioBase.classList.add('bg-gray-700', 'text-white');
        inputSalarioBase.value = '$ 0';
        divCampoRecibeAuxilio.classList.remove('hidden');
        inputSalarioBase.focus();
    } else {
        inputSalarioBase.disabled = true;
        inputSalarioBase.classList.add('bg-gray-800', 'cursor-not-allowed', 'text-gray-400');
        inputSalarioBase.classList.remove('bg-gray-700', 'text-white');
        divCampoRecibeAuxilio.classList.add('hidden');
        
        const paramsAno = obtenerParametrosPorAnio(obtenerAnioFechaFin());
        const factor = parseInt(val, 10);
        const calculado = factor * paramsAno.SMMLV;
        inputSalarioBase.value = formatearMonedaTexto(calculado);
    }
}

function manejarVisibilidadFechaPactada() {
    const tipo = selectTipoContrato.value;
    const motivo = selectMotivoRetiro.value;

    if (tipo === 'Término Fijo' && motivo === 'Despido sin Justa Causa') {
        divCampoFechaPactada.classList.remove('hidden');
        inputFechaPactadaFin.required = true;
    } else {
        divCampoFechaPactada.classList.add('hidden');
        inputFechaPactadaFin.required = false;
    }
}

function actualizarVisibilidadFila(idFila, valor) {
    const fila = document.getElementById(idFila);
    if (!fila) return;
    if (valor > 0) {
        fila.classList.remove('hidden');
    } else {
        fila.classList.add('hidden');
    }
}

function obtenerTextoTiempoLaborado(diasTotales) {
    if (!diasTotales || diasTotales <= 0) return "0 días";
    
    const anios = Math.floor(diasTotales / 360);
    const diasRestantesAnios = diasTotales % 360;
    const meses = Math.floor(diasRestantesAnios / 30);
    const diasEfectivos = diasRestantesAnios % 30;

    let desglose = [];
    if (anios > 0) desglose.push(`${anios} ${anios === 1 ? 'año' : 'años'}`);
    if (meses > 0) desglose.push(`${meses} ${meses === 1 ? 'mes' : 'meses'}`);
    if (diasEfectivos > 0 || desglose.length === 0) desglose.push(`${diasEfectivos} ${diasEfectivos === 1 ? 'día' : 'días'}`);

    return `${diasTotales} días (${desglose.join(', ')})`;
}

function calcularLiquidacion() {
    if (!formLiquidacion.checkValidity()) {
        document.getElementById('val_total').innerText = '$ 0';
        return;
    }

    const salarioBase = desformatearMoneda(inputSalarioBase.value);
    const valorVariables = desformatearMoneda(inputVariables.value);
    const paramsAnoActual = obtenerParametrosPorAnio(obtenerAnioFechaFin());

    let auxTransporte = 0;

    if (selectSmmlv.value === 'otro') {
        let recibeAuxilio = "SI";
        for (const radio of radiosRecibeAuxilio) {
            if (radio.checked) recibeAuxilio = radio.value;
        }
        auxTransporte = (recibeAuxilio === "SI") ? paramsAnoActual.AUX_TRANSPORTE : 0;
    } else {
        auxTransporte = salarioBase <= (2 * paramsAnoActual.SMMLV) ? paramsAnoActual.AUX_TRANSPORTE : 0;
    }

    const baseLiquidacionActual = salarioBase + valorVariables + auxTransporte;
    inputAuxTransporte.value = formatearMonedaTexto(auxTransporte);

    const fInicio = new Date(inputFechaInicio.value + 'T00:00:00');
    const fFin = new Date(inputFechaFin.value + 'T00:00:00');

    if (isNaN(fInicio) || isNaN(fFin) || fFin < fInicio) return;

    const diasTotales = calcularDias360(fInicio, fFin);

    // CÁLCULO DE CESANTÍAS E INTERESES
    const anioFin = fFin.getFullYear();
    const fechaLimiteFondo = new Date(anioFin, 1, 14);

    const inicioAnioRetiro = new Date(anioFin, 0, 1);
    const fechaInicioCesantiasActual = fInicio > inicioAnioRetiro ? fInicio : inicioAnioRetiro;
    const diasCesantiasAnioActual = calcularDias360(fechaInicioCesantiasActual, fFin);

    const cesantiasActual = Math.round((baseLiquidacionActual * diasCesantiasAnioActual) / 360);
    const interesesCesantiasActual = Math.round((cesantiasActual * diasCesantiasAnioActual * 0.12) / 360);

    let cesantiasAnterior = 0;
    let interesesCesantiasAnterior = 0;
    let diasCesantiasAnterior = 0;

    if (fFin <= fechaLimiteFondo && fInicio < inicioAnioRetiro) {
        const anioAnterior = anioFin - 1;
        const inicioAnioAnterior = new Date(anioAnterior, 0, 1);
        const finAnioAnterior = new Date(anioAnterior, 11, 30);

        const fechaInicioCesantiasAnt = fInicio > inicioAnioAnterior ? fInicio : inicioAnioAnterior;
        diasCesantiasAnterior = calcularDias360(fechaInicioCesantiasAnt, finAnioAnterior);

        const paramsAnoAnterior = obtenerParametrosPorAnio(anioAnterior);
        let auxTranspAnterior = 0;
        if (selectSmmlv.value === 'otro') {
            let recibeAuxilio = "SI";
            for (const radio of radiosRecibeAuxilio) {
                if (radio.checked) recibeAuxilio = radio.value;
            }
            auxTranspAnterior = (recibeAuxilio === "SI") ? paramsAnoAnterior.AUX_TRANSPORTE : 0;
        } else {
            auxTranspAnterior = salarioBase <= (2 * paramsAnoAnterior.SMMLV) ? paramsAnoAnterior.AUX_TRANSPORTE : 0;
        }
        const baseLiquidacionAnterior = salarioBase + valorVariables + auxTranspAnterior;

        cesantiasAnterior = Math.round((baseLiquidacionAnterior * diasCesantiasAnterior) / 360);
        interesesCesantiasAnterior = Math.round((cesantiasAnterior * diasCesantiasAnterior * 0.12) / 360);
    }

    // PRIMA DE SERVICIOS
    const inicioSemestreActual = new Date(fFin.getFullYear(), fFin.getMonth() < 6 ? 0 : 6, 1);
    const fechaInicioPrima = fInicio > inicioSemestreActual ? fInicio : inicioSemestreActual;
    const diasPrimaActual = calcularDias360(fechaInicioPrima, fFin);

    const semestreInicio = `${fInicio.getFullYear()}-${fInicio.getMonth() < 6 ? 1 : 2}`;
    const semestreFin = `${fFin.getFullYear()}-${fFin.getMonth() < 6 ? 1 : 2}`;
    const abarcaVariosSemestres = semestreInicio !== semestreFin;

    let primaPendienteAnterior = 0;

    if (abarcaVariosSemestres) {
        divPrimaAnterior.classList.remove('hidden');

        let radioSeleccionado = "SI";
        for (const radio of radiosPrima) {
            if (radio.checked) radioSeleccionado = radio.value;
        }

        if (radioSeleccionado === "NO") {
            const finPrimerSemestre = new Date(fInicio.getFullYear(), fInicio.getMonth() < 6 ? 5 : 11, 30);
            const diasSemestreAnterior = calcularDias360(fInicio, finPrimerSemestre);
            primaPendienteAnterior = Math.round((baseLiquidacionActual * diasSemestreAnterior) / 360);
        }
    } else {
        divPrimaAnterior.classList.add('hidden');
    }

    // VACACIONES
    let tieneVacacionesDisfrutadas = "NO";
    for (const radio of radiosVacaciones) {
        if (radio.checked) tieneVacacionesDisfrutadas = radio.value;
    }

    let diasVacacionesAbonadas = 0; 
    let textoVacacionesPDF = "Ninguna (0 días)";

    if (tieneVacacionesDisfrutadas === "SI") {
        divDespliegueVacaciones.classList.remove('hidden');
        const unidad = selectUnidadVacaciones.value;
        const cantidad = parseInt(selectCantidadVacaciones.value) || 0;

        if (unidad === 'dias') {
            diasVacacionesAbonadas = cantidad * 24; 
            textoVacacionesPDF = `${cantidad} ${cantidad === 1 ? 'Día hábil' : 'Días hábiles'}`;
        } else if (unidad === 'semanas') {
            diasVacacionesAbonadas = cantidad * 144; 
            const diasEq = cantidad * 6;
            textoVacacionesPDF = `${cantidad} ${cantidad === 1 ? 'Semana' : 'Semanas'} (~${diasEq} días hab.)`;
        } else if (unidad === 'periodos') {
            diasVacacionesAbonadas = cantidad * 360; 
            const diasEq = cantidad * 15;
            textoVacacionesPDF = `${cantidad} ${cantidad === 1 ? 'Período / Año' : 'Períodos / Años'} (${diasEq} días hab.)`;
        }
    } else {
        divDespliegueVacaciones.classList.add('hidden');
    }

    const diasEfectivosVacaciones = Math.max(0, diasTotales - diasVacacionesAbonadas);
    const diasHabilesPendientesVacaciones = (diasEfectivosVacaciones * 15) / 360;

    const primaActual = Math.round((baseLiquidacionActual * diasPrimaActual) / 360);
    const vacaciones = Math.round(((salarioBase + valorVariables) * diasEfectivosVacaciones) / 720);

    // INDEMNIZACIÓN
    let indemnizacion = 0;
    const motivo = selectMotivoRetiro.value;
    const tipoContrato = selectTipoContrato.value;

    if (motivo === "Despido sin Justa Causa") {
        const valorDiaSalario = (salarioBase + valorVariables) / 30;

        if (tipoContrato === "Término Indefinido") {
            if ((salarioBase + valorVariables) < (10 * paramsAnoActual.SMMLV)) {
                if (diasTotales <= 360) {
                    indemnizacion = Math.round(valorDiaSalario * 30);
                } else {
                    const diasAdicionales = diasTotales - 360;
                    indemnizacion = Math.round((valorDiaSalario * 30) + (valorDiaSalario * 20 * (diasAdicionales / 360)));
                }
            } else {
                if (diasTotales <= 360) {
                    indemnizacion = Math.round(valorDiaSalario * 20);
                } else {
                    const diasAdicionales = diasTotales - 360;
                    indemnizacion = Math.round((valorDiaSalario * 20) + (valorDiaSalario * 15 * (diasAdicionales / 360)));
                }
            }
        } else if (tipoContrato === "Término Fijo") {
            const fPactada = new Date(inputFechaPactadaFin.value + 'T00:00:00');
            if (!isNaN(fPactada) && fPactada > fFin) {
                const diasFaltantes = calcularDias360(fFin, fPactada) - 1;
                indemnizacion = Math.round(diasFaltantes * valorDiaSalario);
            }
        }
    }

    const totalNeto = cesantiasAnterior + interesesCesantiasAnterior + cesantiasActual + interesesCesantiasActual + primaActual + primaPendienteAnterior + vacaciones + indemnizacion;

    // RENDERIZAR EN UI
    document.getElementById('res_dias').innerText = diasTotales;
    document.getElementById('res_salario').innerText = formatearMonedaTexto(salarioBase);
    document.getElementById('res_variables').innerText = formatearMonedaTexto(valorVariables);
    document.getElementById('res_base_liq').innerText = formatearMonedaTexto(baseLiquidacionActual);

    document.getElementById('dias_cesantias_ant_txt').innerText = diasCesantiasAnterior;
    document.getElementById('val_cesantias_anterior').innerText = formatearMonedaTexto(cesantiasAnterior);
    document.getElementById('val_intereses_anterior').innerText = formatearMonedaTexto(interesesCesantiasAnterior);

    document.getElementById('dias_cesantias_txt').innerText = diasCesantiasAnioActual;
    document.getElementById('val_cesantias').innerText = formatearMonedaTexto(cesantiasActual);
    document.getElementById('val_intereses').innerText = formatearMonedaTexto(interesesCesantiasActual);

    document.getElementById('dias_vacaciones_txt').innerText = diasHabilesPendientesVacaciones.toFixed(1);
    document.getElementById('val_prima').innerText = formatearMonedaTexto(primaActual);
    document.getElementById('val_prima_anterior').innerText = formatearMonedaTexto(primaPendienteAnterior);
    document.getElementById('val_vacaciones').innerText = formatearMonedaTexto(vacaciones);
    document.getElementById('val_indemnizacion').innerText = formatearMonedaTexto(indemnizacion);
    document.getElementById('val_total').innerText = formatearMonedaTexto(totalNeto);

    // FILTRO DE VISIBILIDAD
    actualizarVisibilidadFila('fila_cesantias_anterior', cesantiasAnterior);
    actualizarVisibilidadFila('fila_intereses_anterior', interesesCesantiasAnterior);
    actualizarVisibilidadFila('fila_cesantias_actual', cesantiasActual);
    actualizarVisibilidadFila('fila_intereses_actual', interesesCesantiasActual);
    actualizarVisibilidadFila('fila_prima_actual', primaActual);
    actualizarVisibilidadFila('fila_prima_anterior', primaPendienteAnterior);
    actualizarVisibilidadFila('fila_vacaciones', vacaciones);
    actualizarVisibilidadFila('fila_indemnizacion', indemnizacion);

    btnPdf.dataset.vacacionesTexto = textoVacacionesPDF;
}

function calcularDias360(d1, d2) {
    let day1 = d1.getDate();
    let month1 = d1.getMonth();
    let year1 = d1.getFullYear();

    let day2 = d2.getDate();
    let month2 = d2.getMonth();
    let year2 = d2.getFullYear();

    if (day1 === 31) day1 = 30;
    if (day2 === 31) day2 = 30;

    return ((year2 - year1) * 360) + ((month2 - month1) * 30) + (day2 - day1) + 1;
}

function restablecerFormulario() {
    formLiquidacion.reset();
    selectSmmlv.value = "1";
    manejarCambioSmmlv();
    manejarVisibilidadFechaPactada();
    inputVariables.value = "$ 0";
    actualizarOpcionesCantidadVacaciones();
    calcularLiquidacion();
}

// --- ENVÍO DE DATOS A GOOGLE SHEETS ---
async function guardarEnGoogleSheets(accion) {
    if (!CONFIG || !CONFIG.GOOGLE_SHEETS_WEBAPP_URL) return;

    const tipoContrato = document.getElementById("tipo_contrato").value;
    const motivoRetiro = document.getElementById("motivo_retiro").value;
    
    let fechaPactadaVal = "";
    if (tipoContrato === 'Término Fijo' && motivoRetiro === 'Despido sin Justa Causa') {
        fechaPactadaVal = document.getElementById("fecha_pactada_fin").value || "";
    }

    const payload = {
        timestamp: new Date().toLocaleString('es-CO'),
        accion: accion,
        doc_identidad: document.getElementById("doc_identidad").value || 'N/A',
        fecha_inicio: document.getElementById("fecha_inicio").value || '',
        fecha_fin: document.getElementById("fecha_fin").value || '',
        fecha_pactada_fin: fechaPactadaVal,
        tipo_contrato: tipoContrato,
        motivo_retiro: motivoRetiro,
        salario_base: desformatearMoneda(document.getElementById("res_salario").innerText),
        variables: desformatearMoneda(document.getElementById("res_variables").innerText),
        aux_transporte: desformatearMoneda(document.getElementById("aux_transporte_input").value),
        base_liquidacion: desformatearMoneda(document.getElementById("res_base_liq").innerText),
        dias_laborados: parseInt(document.getElementById("res_dias").innerText, 10) || 0,
        cesantias_anterior: desformatearMoneda(document.getElementById("val_cesantias_anterior").innerText),
        intereses_anterior: desformatearMoneda(document.getElementById("val_intereses_anterior").innerText),
        cesantias_actual: desformatearMoneda(document.getElementById("val_cesantias").innerText),
        intereses_actual: desformatearMoneda(document.getElementById("val_intereses").innerText),
        prima_actual: desformatearMoneda(document.getElementById("val_prima").innerText),
        prima_anterior: desformatearMoneda(document.getElementById("val_prima_anterior").innerText),
        vacaciones: desformatearMoneda(document.getElementById("val_vacaciones").innerText),
        indemnizacion: desformatearMoneda(document.getElementById("val_indemnizacion").innerText),
        total_neto: desformatearMoneda(document.getElementById("val_total").innerText)
    };

    try {
        await fetch(CONFIG.GOOGLE_SHEETS_WEBAPP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Error al registrar en Google Sheets:", error);
    }
}

function cargarImagenBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve({
                dataUrl: canvas.toDataURL('image/png'),
                width: img.width,
                height: img.height
            });
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
}

// --- GENERACIÓN DE URL VERIFICABLE PARA QR ---
function obtenerUrlVerificacionQR() {
    const docIdentidad = document.getElementById('doc_identidad').value || 'N/A';
    const totalFormateado = document.getElementById('val_total').innerText;
    const totalLimpio = desformatearMoneda(totalFormateado);
    const refUnica = `LIQ-${docIdentidad}`;
    const baseUrl = window.location.origin + window.location.pathname;

    const rawString = `${docIdentidad}|${totalLimpio}|${refUnica}`;
    const tokenSeguridad = btoa(rawString);

    const params = new URLSearchParams({
        doc: docIdentidad,
        neto: totalLimpio,
        ref: refUnica,
        h: tokenSeguridad
    });

    return `${baseUrl}?${params.toString()}`;
}

function generarDataUrlQR(urlDestino) {
    return new Promise((resolve) => {
        const container = document.getElementById('qrcode-container');
        container.innerHTML = '';

        const contenidoQR = urlDestino || obtenerUrlVerificacionQR();

        const qrcode = new QRCode(container, {
            text: contenidoQR,
            width: 128,
            height: 128,
            correctLevel: QRCode.CorrectLevel.M
        });

        setTimeout(() => {
            const img = container.querySelector('img');
            const canvas = container.querySelector('canvas');
            if (img && img.src) {
                resolve(img.src);
            } else if (canvas) {
                resolve(canvas.toDataURL('image/png'));
            } else {
                resolve(null);
            }
        }, 100);
    });
}

function validarQRDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const doc = urlParams.get('doc');
    const neto = urlParams.get('neto');
    const ref = urlParams.get('ref');
    const hash = urlParams.get('h');

    if (doc && neto && ref && hash) {
        const hashEsperado = btoa(`${doc}|${neto}|${ref}`);
        
        if (hash === hashEsperado) {
            const netoFormateado = formatearMonedaTexto(neto);
            alert(`✅ DOCUMENTO DE LIQUIDACIÓN AUTÉNTICO\n\nDocumento: ${doc}\nTotal Neto Proyectado: ${netoFormateado}\nReferencia: ${ref}`);
        } else {
            alert("⚠️ ALERTA: Los datos de la liquidación leídos en el QR han sido alterados o no coinciden con la firma digital.");
        }
    }
}

function normalizarMonedaPDF(texto) {
    const num = desformatearMoneda(texto);
    return formatearMonedaTexto(num);
}

// --- EXPORTACIÓN A EXCEL ---
function exportarAExcel() {
    if (!formLiquidacion.checkValidity()) {
        formLiquidacion.reportValidity();
        return;
    }

    guardarEnGoogleSheets("Excel");

    const docIdentidad = document.getElementById('doc_identidad').value || 'N/A';
    const fInicio = document.getElementById('fecha_inicio').value || 'N/A';
    const fFin = document.getElementById('fecha_fin').value || 'N/A';
    const tipoContrato = document.getElementById('tipo_contrato').value;
    const motivoRetiro = document.getElementById('motivo_retiro').value;

    const datos = [
        ["PROYECCIÓN DE LIQUIDACIÓN DE PRESTACIONES SOCIALES"],
        ["Código Sustantivo del Trabajo (Colombia)"],
        [],
        ["DATOS CONTRACTUALES"],
        ["Documento de Identidad:", docIdentidad],
        ["Fecha de Inicio:", fInicio, "Fecha de Fin:", fFin],
        ["Tipo de Contrato:", tipoContrato, "Motivo de Retiro:", motivoRetiro],
        ["Salario Base Mensual:", document.getElementById('res_salario').innerText, "Auxilio de Transporte:", document.getElementById('aux_transporte_input').value],
        ["Base de Liquidación:", document.getElementById('res_base_liq').innerText, "Días Laborados Totales:", document.getElementById('res_dias').innerText],
        [],
        ["DESGLOSE DE CONCEPTOS A LIQUIDAR", "VALOR PROYECTADO"]
    ];

    const idsFilas = [
        { id: 'fila_cesantias_anterior', desc: 'Cesantías año anterior', valId: 'val_cesantias_anterior' },
        { id: 'fila_intereses_anterior', desc: 'Intereses sobre Cesantías año anterior', valId: 'val_intereses_anterior' },
        { id: 'fila_cesantias_actual', desc: 'Cesantías año actual', valId: 'val_cesantias' },
        { id: 'fila_intereses_actual', desc: 'Intereses sobre Cesantías año actual', valId: 'val_intereses' },
        { id: 'fila_prima_actual', desc: 'Prima de Servicios (Período Actual)', valId: 'val_prima' },
        { id: 'fila_prima_anterior', desc: 'Prima de Servicios Pendiente Anterior', valId: 'val_prima_anterior' },
        { id: 'fila_vacaciones', desc: 'Vacaciones Pendientes', valId: 'val_vacaciones' },
        { id: 'fila_indemnizacion', desc: 'Indemnización por Finalización', valId: 'val_indemnizacion' }
    ];

    idsFilas.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && !el.classList.contains('hidden')) {
            const valTexto = document.getElementById(item.valId).innerText;
            datos.push([item.desc, valTexto]);
        }
    });

    datos.push([]);
    datos.push(["NETO TOTAL A PAGAR PROYECTADO:", document.getElementById('val_total').innerText]);

    const ws = XLSX.utils.aoa_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Liquidación Proyectada");
    XLSX.writeFile(wb, `Proyeccion_Liquidacion_${docIdentidad}.xlsx`);
}

// --- GENERACIÓN DE PDF ---
async function generarPDF() {
    if (!formLiquidacion.checkValidity()) {
        formLiquidacion.reportValidity();
        return;
    }

    guardarEnGoogleSheets("PDF");

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const docIdentidad = document.getElementById('doc_identidad').value || 'N/A';
        const fInicio = document.getElementById('fecha_inicio').value ? document.getElementById('fecha_inicio').value.split('-').reverse().join('/') : 'N/A';
        const fFin = document.getElementById('fecha_fin').value ? document.getElementById('fecha_fin').value.split('-').reverse().join('/') : 'N/A';
        const tipoContrato = document.getElementById('tipo_contrato').value;
        const motivoRetiro = document.getElementById('motivo_retiro').value;
        
        const hoy = new Date();
        const fechaEmision = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;

        const salarioBase = normalizarMonedaPDF(document.getElementById('res_salario').innerText);
        const auxTransporte = normalizarMonedaPDF(document.getElementById('aux_transporte_input').value);
        const horasExtrasVariables = normalizarMonedaPDF(document.getElementById('res_variables').innerText);
        const baseLiquidacion = normalizarMonedaPDF(document.getElementById('res_base_liq').innerText);
        const diasTotalesNum = parseInt(document.getElementById('res_dias').innerText, 10) || 0;
        const textoTiempoLaborado = obtenerTextoTiempoLaborado(diasTotalesNum);
        const textoVacaciones = btnPdf.dataset.vacacionesTexto || "Ninguna (0 días)";

        // ENCABEZADO
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text("PROYECCIÓN DE LIQUIDACIÓN DE PRESTACIONES SOCIALES", 195, 20, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text("Conforme al Código Sustantivo del Trabajo (Colombia)", 195, 26, { align: "right" });

        try {
            const logo = await cargarImagenBase64('assets/logo.png');
            const maxW = 42;
            const maxH = 18;
            
            let imgW = maxW;
            let imgH = (logo.height * maxW) / logo.width;

            if (imgH > maxH) {
                imgH = maxH;
                imgW = (logo.width * maxH) / logo.height;
            }

            const posX = 15;
            const posY = 13 + ((maxH - imgH) / 2);

            doc.addImage(logo.dataUrl, 'PNG', posX, posY, imgW, imgH);
        } catch (e) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text("[ LOGO EMPRESA ]", 15, 22);
        }

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.8);
        doc.line(15, 34, 195, 34);

        // METADATOS
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.roundedRect(15, 38, 180, 11, 1, 1, 'FD');

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Documento:", 18, 45);
        doc.setFont("helvetica", "normal");
        doc.text(docIdentidad, 37, 45);

        doc.setFont("helvetica", "bold");
        doc.text("Fecha Emisión:", 148, 45);
        doc.setFont("helvetica", "normal");
        doc.text(fechaEmision, 171, 45);

        // DATOS CONTRACTUALES
        const startYContractual = 53;

        doc.autoTable({
            startY: startYContractual + 9,
            margin: { left: 18, right: 18 },
            theme: 'plain',
            styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.5, textColor: [0, 0, 0] },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 41 },
                1: { cellWidth: 46 },
                2: { fontStyle: 'bold', cellWidth: 41 },
                3: { cellWidth: 46, fontSize: 7.5 }
            },
            body: [
                ['Fecha de Inicio:', fInicio, 'Fecha de Fin:', fFin],
                ['Tipo de Contrato:', tipoContrato, 'Motivo de Retiro:', motivoRetiro],
                ['Salario Base Mensual:', salarioBase, 'Auxilio de Transporte:', auxTransporte],
                ['Base de Liquidación:', baseLiquidacion, 'Días Laborados Totales:', textoTiempoLaborado],
                ['Vacaciones Disfrutadas:', textoVacaciones, 'Horas Extras y Variables:', horasExtrasVariables]
            ]
        });

        const finalYContractual = doc.lastAutoTable.finalY + 2;
        const heightContractualDinámico = finalYContractual - startYContractual;

        doc.setFillColor(252, 252, 252);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.roundedRect(15, startYContractual, 180, heightContractualDinámico, 1, 1, 'FD');

        doc.setFillColor(0, 0, 0);
        doc.rect(15, startYContractual, 180, 7.5, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("DATOS CONTRACTUALES", 18, startYContractual + 5);

        doc.autoTable({
            startY: startYContractual + 9,
            margin: { left: 18, right: 18 },
            theme: 'plain',
            styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.5, textColor: [0, 0, 0] },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 41 },
                1: { cellWidth: 46 },
                2: { fontStyle: 'bold', cellWidth: 41 },
                3: { cellWidth: 46, fontSize: 7.5 }
            },
            body: [
                ['Fecha de Inicio:', fInicio, 'Fecha de Fin:', fFin],
                ['Tipo de Contrato:', tipoContrato, 'Motivo de Retiro:', motivoRetiro],
                ['Salario Base Mensual:', salarioBase, 'Auxilio de Transporte:', auxTransporte],
                ['Base de Liquidación:', baseLiquidacion, 'Días Laborados Totales:', textoTiempoLaborado],
                ['Vacaciones Disfrutadas:', textoVacaciones, 'Horas Extras y Variables:', horasExtrasVariables]
            ]
        });

        // TABLA DE CONCEPTOS
        const startYConceptos = doc.lastAutoTable.finalY + 5;
        const bodyConceptos = [];

        const idsFilas = [
            { id: 'fila_cesantias_anterior', desc: 'Cesantías año anterior (' + document.getElementById('dias_cesantias_ant_txt').innerText + ' días)', valId: 'val_cesantias_anterior' },
            { id: 'fila_intereses_anterior', desc: 'Intereses sobre Cesantías año anterior (12% anual)', valId: 'val_intereses_anterior' },
            { id: 'fila_cesantias_actual', desc: 'Cesantías año actual (' + document.getElementById('dias_cesantias_txt').innerText + ' días)', valId: 'val_cesantias' },
            { id: 'fila_intereses_actual', desc: 'Intereses sobre Cesantías año actual (12% anual)', valId: 'val_intereses' },
            { id: 'fila_prima_actual', desc: 'Prima de Servicios (Período Actual)', valId: 'val_prima' },
            { id: 'fila_prima_anterior', desc: 'Prima de Servicios Pendiente Anterior', valId: 'val_prima_anterior' },
            { id: 'fila_vacaciones', desc: 'Vacaciones Pendientes (' + document.getElementById('dias_vacaciones_txt').innerText + ' días hábiles eq.)', valId: 'val_vacaciones' },
            { id: 'fila_indemnizacion', desc: 'Indemnización por Despido / Finalización', valId: 'val_indemnizacion' }
        ];

        idsFilas.forEach(item => {
            const el = document.getElementById(item.id);
            if (el && !el.classList.contains('hidden')) {
                const valTexto = normalizarMonedaPDF(document.getElementById(item.valId).innerText);
                bodyConceptos.push([item.desc, valTexto]);
            }
        });

        const totalFormateado = normalizarMonedaPDF(document.getElementById('val_total').innerText);

        doc.autoTable({
            startY: startYConceptos,
            margin: { left: 15, right: 15 },
            head: [['DESGLOSE DE CONCEPTOS A LIQUIDAR', 'VALOR PROYECTADO']],
            body: bodyConceptos,
            foot: [['NETO TOTAL A PAGAR PROYECTADO:', totalFormateado]],
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'left', font: 'helvetica' },
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 9.5, fontStyle: 'bold', font: 'helvetica' },
            styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.8, lineColor: [0, 0, 0], lineWidth: 0.3, textColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 125 },
                1: { cellWidth: 55, halign: 'right', fontStyle: 'bold' }
            },
            didParseCell: function(data) {
                if (data.section === 'foot' && data.column.index === 1) {
                    data.cell.styles.halign = 'right';
                    data.cell.styles.font = 'helvetica';
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        // NOTA LEGAL Y QR
        const finalYTablaConceptos = doc.lastAutoTable.finalY + 5;
        const urlVerificacion = obtenerUrlVerificacionQR();
        const qrDataUrl = await generarDataUrlQR(urlVerificacion);

        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.roundedRect(15, finalYTablaConceptos, 180, 22, 1, 1, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("Nota Importante / Exención de responsabilidad:", 19, finalYTablaConceptos + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        const textoNota = "El presente documento constituye un cálculo estimativo e informativo elaborado con base en los datos ingresados y los parámetros del Código Sustantivo del Trabajo en Colombia. Al ser un ejercicio de proyección, no constituye una liquidación oficial vinculante ni genera obligaciones contractuales o legales inmediatas entre las partes.";
        doc.text(doc.splitTextToSize(textoNota, 150), 19, finalYTablaConceptos + 9);

        if (qrDataUrl) {
            const qrX = 172;
            const qrY = finalYTablaConceptos + 2;
            const qrSize = 18;

            doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
            doc.link(qrX, qrY, qrSize, qrSize, { url: urlVerificacion });
        }

        doc.save(`Proyeccion_Liquidacion_${docIdentidad}.pdf`);
    } catch (err) {
        console.error("Error al generar PDF:", err);
        alert("Ocurrió un error al generar el PDF: " + err.message);
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    validarQRDesdeURL();
    actualizarOpcionesCantidadVacaciones();
    manejarCambioSmmlv();
    manejarVisibilidadFechaPactada();
    calcularLiquidacion();

    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(element => {
        element.addEventListener('change', () => {
            manejarVisibilidadFechaPactada();
            calcularLiquidacion();
        });
        element.addEventListener('keyup', calcularLiquidacion);
    });

    inputSalarioBase.addEventListener('input', () => {
        if (selectSmmlv.value === 'otro') {
            aplicarMascaraMonedaEnInput(inputSalarioBase);
            calcularLiquidacion();
        }
    });

    inputVariables.addEventListener('input', () => {
        aplicarMascaraMonedaEnInput(inputVariables);
        calcularLiquidacion();
    });

    selectSmmlv.addEventListener('change', () => {
        manejarCambioSmmlv();
        calcularLiquidacion();
    });

    inputFechaFin.addEventListener('change', () => {
        if (selectSmmlv.value !== 'otro') {
            manejarCambioSmmlv();
        }
        calcularLiquidacion();
    });

    selectUnidadVacaciones.addEventListener('change', () => {
        actualizarOpcionesCantidadVacaciones();
        calcularLiquidacion();
    });

    btnLimpiar.addEventListener('click', restablecerFormulario);
    btnPdf.addEventListener('click', async () => await generarPDF());
    btnExcel.addEventListener('click', exportarAExcel);
    btnImprimir.addEventListener('click', () => {
        if (formLiquidacion.checkValidity()) {
            guardarEnGoogleSheets("Imprimir");
            window.print();
        } else {
            formLiquidacion.reportValidity();
        }
    });
});