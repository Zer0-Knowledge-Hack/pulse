# Guía Sencilla: Qué hace cada Agente y Cómo Probarlos

---

## 1. La Idea del Proyecto en Palabras Simples

Imagina que **Pulse** es como una **tienda o agencia de profesionales digitales** (freelancers robot).
Cada robot tiene su propia alcancía digital (su billetera) y sabe hacer un trabajo muy específico.

Cuando tú o una aplicación necesita un trabajo:

1. Le dices al robot: *"¿Cuánto me cobras por hacer esto?"*
2. El robot calcula el costo y te firma una nota formal con su precio acordado.
3. El dinero queda guardado en una caja fuerte segura hasta que el robot termine la tarea.
4. El robot hace el trabajo, entrega el resultado y cobra su pago.

---

## 2. ¿Qué hace cada uno de los 4 Robots? (Con ejemplos reales)

```
                     ╔════════════════════════════════════════╗
                     ║              PULSE MARKET              ║
                     ║       (Mercado de Robots Sellers)      ║
                     ╚════════════════════════════════════════╝
                                         │
        ┌───────────────────┬────────────┴───────┬───────────────────┐
        ▼                   ▼                    ▼                   ▼
 ┌──────────────┐    ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
 │   hfwatch    │    │ rangekeeper  │     │ yieldrouter  │    │  gridrunner  │
 │ (Salvavidas) │    │(Casa Cambio) │     │ (Comparador) │    │ (Comerciante)│
 └──────────────┘    └──────────────┘     └──────────────┘    └──────────────┘
```

---

### 🤖 1. `hfwatch` — "El Salvavidas del Préstamo"

* **El problema:** En las finanzas cripto, cuando pides dinero prestado dejas tus monedas como garantía (empeño). Si el valor de tu garantía baja mucho, el sistema te quita tus monedas automáticamente (te liquida) y pierdes dinero.
* **Qué hace este robot:** Es un vigilante 24/7. Revisa constantemente tu préstamo en Venus Protocol. Si ve que el precio de tus monedas está cayendo y estás a punto de perderlas, calcula tu nivel de riesgo exacto para avisarte antes de que sea tarde.
* **El resultado que entrega:** Un reporte de riesgo que dice: *"Tu salud es 1.1 (peligro), necesitas agregar 50 monedas más para no perder tu garantía"*.

---

### 🤖 2. `rangekeeper` — "El Gestor de la Casa de Cambio"

* **El problema:** Si pones tus monedas en PancakeSwap para ganar comisiones cada vez que otras personas intercambian tokens, solo ganas dinero si el precio se mantiene dentro del rango que elegiste. Si el precio se sale de ese rango, dejas de ganar comisiones.
* **Qué hace este robot:** Analiza cómo se está moviendo el mercado hoy y calcula matemáticamente entre qué precio mínimo y máximo debes colocar tu dinero para ganar el máximo de comisiones posible.
* **El resultado que entrega:** Una recomendación exacta: *"Coloca tu liquidez entre $580 y $620 para capturar el 95% de las transacciones de hoy"*.

---

### 🤖 3. `yieldrouter` — "El Comparador de Cuentas de Ahorro"

* **El problema:** En BNB Chain hay docenas de lugares seguros donde puedes depositar tus monedas para ganar intereses, pero los intereses cambian a cada hora y es agotador buscar cuál paga más.
* **Qué hace este robot:** Es como un "Trivago" o "Despegar" del dinero: revisa los diferentes bancos y bóvedas en tiempo real, compara comisiones y riesgos, y encuentra cuál es la opción que te dará más rendimiento por tus ahorros.
* **El resultado que entrega:** Un plan ordenado: *"La mejor opción hoy es la Bóveda X con 8.5% anual; la segunda es la Bóveda Y con 6.2%"*.

---

### 🤖 4. `gridrunner` — "El Comerciante Automático de Rebajas"

* **El problema:** Si compras y vendes monedas manualmente todo el día para ganar pequeñas diferencias de precio, te cansas o cometes errores emocionales.
* **Qué hace este robot:** Dibuja una escalera (cuadrícula o *grid*) de precios. Calcula a qué niveles comprar un poquito cuando el precio baje, y a qué niveles vender cuando suba, atrapando pequeñas ganancias automáticas en días de volatilidad.
* **El resultado que entrega:** Un tablero con la cuadrícula de órdenes lista: *"Coloca 5 compras escalonadas cada $5 hacia abajo y 5 ventas cada $5 hacia arriba"*.

---

## 3. ¿Cómo se prueban? ¿Desde el Navegador o desde la Terminal?

Los agentes son pequeños programas servidores (como páginas web en miniatura) que ya están corriendo en tu computadora. Puedes probarlos de **dos formas muy fáciles**:

---

### Opción A: Probarlos desde tu Navegador Web (Con 1 Clic)

No necesitas escribir comandos. Abre tu navegador (Chrome, Edge, etc.) y haz clic o pega estos enlaces:

1. **Ver si el robot está vivo y sano (`/ping`):**
   * Robot 1: [http://localhost:9001/ping](http://localhost:9001/ping)
   * Robot 2: [http://localhost:9002/ping](http://localhost:9002/ping)
   * Robot 3: [http://localhost:9003/ping](http://localhost:9003/ping)
   * Robot 4: [http://localhost:9004/ping](http://localhost:9004/ping)

   👉 *En la pantalla verás:* `{"status": "HEALTHY"}` (significa que está funcionando perfectamente).

2. **Ver la Ficha de Identidad del robot (`Agent Card`):**
   * [http://localhost:9001/.well-known/agent-card.json](http://localhost:9001/.well-known/agent-card.json)

   👉 *En la pantalla verás:* Su documento de identidad oficial, su nombre, qué tareas sabe hacer (`negotiate`, `notify_funded`) y cómo comunicarse con él.

---

### Opción B: Probarlos desde la Terminal (Pidiendo una Cotización Real)

Para ver la magia donde el robot **firma con su billetera**, se hace desde la terminal de PowerShell en 2 pasos:

#### Paso 1: Abrir PowerShell

Abre cualquier terminal de PowerShell en tu computadora.

#### Paso 2: Copiar y pegar este bloque tal cual (sin cambiar nada)

```powershell
# Le enviamos una pregunta al Robot 1 (hfwatch) en el puerto 9001:
Invoke-RestMethod -Uri "http://127.0.0.1:9001/" -Method Post -ContentType "application/json" -Body '{
  "jsonrpc": "2.0",
  "method": "message/send",
  "id": "1",
  "params": {
    "message": {
      "messageId": "peticion-de-prueba-01",
      "role": "user",
      "parts": [
        {
          "kind": "data",
          "data": {
            "skill": "negotiate",
            "task_description": "Vigila mi cuenta de préstamo en Venus",
            "terms": {
              "deliverables": "Reporte de riesgo",
              "quality_standards": "Datos verificados"
            }
          }
        }
      ]
    }
  }
}' | ConvertTo-Json -Depth 10
```

#### ¿Qué significa lo que te responde la terminal?

Verás algo como esto:

```json
{
  "accepted": true,
  "terms": {
    "price": "100000000000000000",
    "currency": "0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565"
  },
  "provider_sig": "0x2a191aad91213758..."
}
```

* **`accepted: true`**: El robot leyó tu solicitud y aceptó el trabajo.
* **`price`**: Es el precio que cobra (0.1 unidades de la moneda `$U`).
* **`provider_sig`**: **Esta es la firma digital única.** El robot usó su clave privada secreta para estampar su firma digital irrepetible. Con esto demuestra matemáticamente que él se compromete con ese precio.

---

## 4. ¿Cómo volver a iniciarlos si cierras la computadora?

Si reinicias la máquina o cierras las consolas, cada robot se inicia entrando a su carpeta y escribiendo:

* Para Robot 1:

  ```powershell
  cd d:\Proyectos\Blockchain\pulse\agents\hfwatch
  bag dev --port 9001
  ```

* Para Robot 2:

  ```powershell
  cd d:\Proyectos\Blockchain\pulse\agents\rangekeeper
  bag dev --port 9002
  ```

* Para Robot 3:

  ```powershell
  cd d:\Proyectos\Blockchain\pulse\agents\yieldrouter
  bag dev --port 9003
  ```

* Para Robot 4:

  ```powershell
  cd d:\Proyectos\Blockchain\pulse\agents\gridrunner
  bag dev --port 9004
  ```
