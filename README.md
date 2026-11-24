# Hermanos Ayala · web

Web estática de una página (HTML + CSS + JS, sin dependencias) para Hermanos Ayala, el cash & carry mayorista de alimentación, bebidas, droguería y perfumería que está en la A-376, km 20 (Utrera, Sevilla). Los datos, el análisis de las referencias y las fuentes están en `research/BRIEF.md`.

Para verla en local: `python3 -m http.server 8790` y abrir http://localhost:8790

## Estilo

- **Referencia principal**: apc-pallets.nl, que es la que más gustó. De ella se toman:
  - la tipografía **Aspekta** (libre, con licencia OFL, servida desde nuestro dominio)
  - los titulares finos (peso 350)
  - el hero con vídeo de dron y líneas trazadas sobre el terreno
  - el panel pálido con una columna sticky y líneas punteadas
  - las tarjetas de categoría con etiqueta de color
  - la lista de marca propia con una tarjeta sticky que cambia
  - el panel de foto con una tarjeta flotante de contacto
  - el contador "1960" con dígitos que ruedan
  - las tarjetas de reconocimientos con pastillas
  - el párrafo que se rellena de color al hacer scroll
  - el acordeón con un bloque de icono
  - el pie con el logo gigante
- **Referencia secundaria**: stoop-template. De ella salen las tarjetas a sangre que se apilan (sección "La nave"), los pasos con línea de progreso e imagen que cambia ("Cómo llegar") y el cierre sobre vídeo.
- **Paleta de la marca**: amarillo `#FFD100`, tinta `#151412`, amarillo pálido `#FAF4D6` (equivale al verde menta de APC) y blanco.
- Sin antetítulos sobre los títulos y sin punto final en los titulares.

## El vídeo de la portada

No había material audiovisual y la cuenta de Higgsfield estaba **sin créditos** (plan free, 0 créditos y sin generaciones gratis), así que no se pudo generar vídeo con IA. En su lugar se ha hecho un **cenital real**:

- Se parte de la ortofoto oficial **PNOA del IGN**, que tiene licencia CC BY 4.0 y permite uso comercial con atribución. La atribución está **solo en el aviso legal**: el usuario pidió quitarla de la portada y del pie.
- `tools/render_drone.py` simula un dron que baja y gira despacio sobre la nave. Incrusta las líneas en amarillo (la A-376 y los muelles), el contorno blanco del recinto y los rótulos "Muelles de descarga", "Parking de clientes" y "Entrada · A-376, km 20".
- El vídeo va y vuelve para que el bucle no salte.
- `tools/build_videos.sh` regenera los vídeos:
  - `ayala-cenital-1080.mp4` y `ayala-cenital-720.mp4` (escritorio)
  - `ayala-cenital-movil.mp4` (vertical)
  - los posters

  El vídeo de cierre (`ayala-olivar-1080.mp4` y `-720.mp4`, un plano más abierto) se regenera con `tools/build_cta.sh`. Va a crf 34 con `-tune film` porque el olivar pesa mucho: a crf 27 ocupaba 21 MB.
- Las coordenadas de los trazos están medidas sobre el mosaico reducido de 1600 px. El centro de la nave es (3200, 2060) en el mosaico z19.

### Si se quiere vídeo con IA más adelante

Cuando haya créditos en Higgsfield (o en otra herramienta), lo más fiable es este flujo:

1. Usar como referencia de imagen `assets/img/ortofoto-hermanos-ayala-utrera.webp` (la parcela real) y `assets/img/hermanos-ayala-fachada-utrera.webp` (la fachada negra y amarilla con el rótulo ovalado).
2. Generar primero una imagen fija con este prompt: *"Photorealistic oblique drone photo, golden hour, of a single large warehouse with black and yellow cladding and a yellow oval 'Ayala' sign, surrounded by olive groves next to a dual carriageway in Andalusia; refrigerated trucks parked at loading docks along one long side, customer car park with trees on the other side, solar panels on the roof"*.
3. Animar esa imagen con un modelo imagen-a-vídeo (Kling 3.0 o Seedance 2.5) de 8 a 10 s en 16:9, sin audio, con este prompt: *"slow cinematic drone push-in and gentle orbit, trucks slowly moving to the docks, no cuts"*.
4. Hacer también una versión 9:16 para móvil.
5. Sustituir los `data-src-*` del `<video>` de la portada.

## Estructura

`index.html`, en este orden:

1. **Portada**: el cenital con el titular "Tu mayorista de confianza desde 1960", el botón "¿Hablamos?" con email y teléfono, y la pausa del vídeo.
2. **Presentación**: panel pálido con la columna sticky "Mayoristas de…". El texto se rellena con el scroll (`data-fill`, igual que el párrafo del punto 7). El relleno termina cuando el centro del texto llega a media pantalla.
3. **Categorías**: Alimentación, Bebidas y Droguería y perfumería, todas con productos sobre fondo crema y enlazadas a la Marca Ayala.
   - Las bebidas (vino Protos, ron Havana Club y whisky DYC) están recortadas del folleto 545, página 12. Son de baja resolución (unos 350 px de alto), así que conviene sustituirlas por packshots buenos.
   - Todos los packshots llevan **fondo transparente real**, hecho con `tools/quitar_fondo.py`; con `--centro` quita además los adornos sueltos del folleto. Antes se usaba `mix-blend-mode: multiply` y daba un destello blanco en las transiciones.
4. **Marca Ayala**: va destacada sobre fondo amarillo, con el sello, el lema "Tu marca de confianza desde 1960" y un título grande. Tiene siete familias con los packshots de la web antigua. Rota sola mientras se ve, con un fundido entre familias, y se para cuando el usuario toca. En móvil las familias son pastillas que se desplazan hasta la activa.
5. **¿Buscas algo concreto?**: foto de las cajas con una tarjeta flotante.
6. **1960**: el contador y cuatro tarjetas de reconocimientos (Medalla de Oro, marca propia, energía solar y Grupo IFA), que aparecen de una en una.
7. Párrafo que se rellena.
8. **La nave**: cuatro tarjetas apiladas (pasillos, charcutería, cajas y muelles).
9. **Proveedores y transportistas**: foto del camión en el muelle a la izquierda y acordeón a la derecha (horario de descarga, llegada y espera). El abierto se marca con el icono relleno, sin fondo blanco.
10. **Cómo llegar**: la sección se queda fija (360vh, con `.pasos-pin` sticky) y el scroll recorre los cuatro pasos con una barra de progreso. Al pulsar un paso, la página se desplaza hasta él. El paso 3 enseña el **vídeo del aparcamiento** que mandó el cliente: el original vertical (478 × 850, de WhatsApp) está en `source-assets/video-cliente/`. Se ha recortado a 5:4 centrado en la fachada, del segundo 2,5 al 14,5, y escalado al doble. Solo se reproduce mientras ese paso está activo. El paso 4 usa la foto del pasillo.
11. **Folletos del Club Ayala Siglo XXI**: se abren en un visor dentro de la página (`<dialog>`) con las páginas en WebP (`assets/folletos/<n>/pNN.webp`) y un botón para descargar el PDF. Funciona también en iOS, donde los PDF en iframe solo enseñan la primera página.
12. **Contacto**: foto de la fachada con tarjeta, horario con el día de hoy marcado y el estado abierto/cerrado en hora de Madrid, y un mapa que solo carga si se pulsa.
13. **Cierre** con el vídeo del olivar.
14. **Pie**:
    - datos de la empresa, canal ético, Grupo IFA y el cartel NextGenerationEU (obligatorio por la ayuda)
    - el sello de la navbar
    - una barra con el copyright a la izquierda, "Made by" en el centro y las páginas legales a la derecha

Otros ficheros:

- `assets/logo-ayala.svg` es el wordmark, **vectorizado con potrace** desde la portada del folleto. `assets/logo-ayala-sello.svg` es el óvalo amarillo con el aro negro, recreado a partir del rótulo de la fachada.
- Las páginas `privacidad.html`, `aviso-legal.html` y `cookies.html` están en noindex. La web no usa cookies.
- `vercel.json` tiene redirecciones 301 desde las URL de la web Joomla antigua (incluidas `/en`, `/fr`, `/pt` y los PDF de folletos).
- JSON-LD `WholesaleStore`.
- No se suben `source-assets/` (web antigua, fotos de Google, mosaicos de satélite), `research/` ni `tools/` (ver `.vercelignore`).

## Animaciones y responsive

- **Aparición al hacer scroll**: en `app.js`, la lista `ANIM` marca con `.reveal` el contenido de todas las secciones.
  - Los elementos entran de abajo arriba una sola vez, con un keyframe `aparece` para no pisar las transiciones de botones y tarjetas.
  - Los hermanos entran escalonados (`--d`, 0,08 s entre uno y otro, con un máximo de 0,48 s).
  - Las fotos grandes (`.reveal-img`) entran además con un zoom suave de 1,07 a 1.
  - Si el sistema tiene activado "reducir movimiento", todo aparece sin animación.
- **Efectos propios**:
  - vídeo y titular de la portada
  - relleno del texto letra a letra (`data-fill`)
  - contador 1960
  - fundido de la Marca Ayala
  - pasos fijados de "Cómo llegar"
  - tarjetas apiladas de "La nave"
- **Cortes**:
  - **Más de 1080 px**: escritorio. Revisado a 1280, 1440 y 1600.
  - **700–1080 px**: tablet. Revisado a 820 y 1024.
    - La tarjeta de Alimentación va en horizontal, con los productos a la izquierda y el texto a la derecha.
    - La Marca Ayala tiene dos columnas.
    - El horario es una rejilla de tres columnas con el mapa debajo.
    - El pie va en dos columnas.
  - **Menos de 700 px**: móvil. Revisado a 360, 375 y 390.
- Sin scroll horizontal en ninguna medida (`overflow-x: clip`; las rejillas con `minmax(0, 1fr)`).

## Pendiente antes de publicar

- [ ] **Logo**: pedir el vector original. El actual está vectorizado desde un folleto de 1075 px y tiene los bordes algo irregulares si se amplía mucho (pie).
- [ ] **Vídeo del aparcamiento**: si lo pueden grabar en horizontal y en 4K (sin pasar por WhatsApp), se podría usar a pantalla completa, por ejemplo en la sección de contacto.
- [ ] **Fotos propias**: todas las de la nave son de clientes en Google (de móvil y algunas antiguas, con mascarillas en las cajas). Habría que hacer una sesión en la nave: pasillos, muelles con camiones, fachada al atardecer, equipo y hermanos Ayala. Las ideales serían de dron.
- [ ] **Historia**: confirmar el año de fundación (los envases dicen "desde 1960") y si pueden contar la historia de los hermanos (nombres, generaciones).
- [ ] **Grupo IFA**: confirmar que siguen siendo socios (sale de un logo de la web antigua).
- [ ] **Medalla de Oro**: confirmar quién la concede y en qué año.
- [ ] **Clientes**: ¿se vende solo a profesionales? ¿hace falta tarjeta de cliente o CIF? Si es así, añadir un paso "Hazte cliente".
- [ ] **Proveedores**: los textos "Llegada y muelles" y "Mientras esperas" salen de reseñas (documentación en recepción, asignación de muelle, bar con bocadillos). Hay que confirmarlos con ellos.
- [ ] **Folletos**: los tres PDF son los de la web antigua. El 544 dice "Oferta válida hasta el 28 de noviembre de 2026". Cuando salga uno nuevo hay que:
  - exportar sus páginas a `assets/folletos/<n>/`
  - actualizar `data-paginas`
  - decidir quién se encarga de hacerlo
- [ ] **Dirección**: Google dice km 20,3, la web km 20 (salida 21) y el aviso legal km 20,5. Se usa "km 20 · salida 21" en la web y 20,5 en el aviso legal.
- [ ] **Superficie**: la nave mide unos 330 × 150 m a ojo sobre la ortofoto. Si dan la cifra oficial de m², se puede usar en el contador o en "La nave".
- [ ] **Idiomas**: la web antigua tenía en, fr y pt (solo la página de productos). De momento esas rutas redirigen a la portada.
- [ ] **Twitter @ayala_marca**: comprobar si sigue activo antes de enlazarlo.
- [ ] **Reseñas de Google**: 3,6★ con 650 reseñas, la mayoría quejas de camioneros por la descarga. Por eso no se muestran. La sección de proveedores intenta prevenir esas quejas.
- [ ] Tras publicar:
  - dar de alta la web en Search Console y enviar el sitemap
  - revisar que las redirecciones de las URL antiguas funcionan
