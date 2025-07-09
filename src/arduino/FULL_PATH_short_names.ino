#include <ETH.h>
#include <WiFiUdp.h>

WiFiUDP udp;
IPAddress serverIp(192, 168, 68, 101);
const int udpPort = 4210;

// Configuración para WT32-ETH01
#define ETH_PHY_ADDR       1
#define ETH_PHY_TYPE       ETH_PHY_LAN8720
#define ETH_PHY_MDC_PIN    23
#define ETH_PHY_MDIO_PIN   18
#define ETH_PHY_POWER      16
#define ETH_CLOCK_MODE     ETH_CLOCK_GPIO17_OUT

struct Event {
  const char* message;
  unsigned long delayAfter;
};

// Secuencia con mensajes reducidos
Event sequence[] = {
  { "P1R", 3000 },    // PLAYER1_READY
  { "P2R", 3000 },    // PLAYER2_READY
  { "F13", 4000 },    // FRAME13
  { "B1_20", 2000 },  // BARRA1_20
  { "B2_20", 2000 },  // BARRA2_20
  { "B2_10", 2000 },  // BARRA2_10
  { "B1_10", 200 },   // BARRA1_10
  { "B2_100", 2000 }, // BARRA2_100
  { "F14", 4500 },    // FRAME14
  { "F12", 5000 },    // FRAME12 (5 segundos para visualizar)
  { "F5", 350 },      // FRAME5
  { "B1_20", 450 },   // BARRA1_20
  { "B2_20", 320 },   // BARRA2_20
  { "B2_10", 200 },   // BARRA2_10
  { "B1_10", 150 },   // BARRA1_10
  { "B2_100", 25000 } // BARRA2_100
};

const int sequenceLength = sizeof(sequence) / sizeof(sequence[0]);

int currentEvent = -1;
unsigned long nextEventTime = 0;
bool sequenceComplete = false;

void setup() {
  Serial.begin(115200);

  ETH.begin(
    ETH_PHY_TYPE,
    ETH_PHY_ADDR,
    ETH_PHY_MDC_PIN,
    ETH_PHY_MDIO_PIN,
    ETH_PHY_POWER,
    ETH_CLOCK_MODE
  );

  Serial.println("Esperando conexión Ethernet...");
  uint32_t timeout = millis() + 20000;
  while (!ETH.linkUp()) {
    if (millis() > timeout) {
      Serial.println("❌ Fallo en conexión física");
      return;
    }
    delay(500);
    Serial.print(".");
  }

  timeout = millis() + 10000;
  while (ETH.localIP() == IPAddress(0, 0, 0, 0)) {
    if (millis() > timeout) {
      Serial.println("❌ Fallo al obtener IP");
      return;
    }
    delay(500);
    Serial.print("*");
  }

  Serial.println("\n✅ Conexión Ethernet establecida");
  Serial.print("IP: ");
  Serial.println(ETH.localIP());
  Serial.print("Velocidad: ");
  Serial.print(ETH.linkSpeed());
  Serial.println("Mbps");

  nextEventTime = millis();
}

void sendEvent(const char* msg) {
  udp.beginPacket(serverIp, udpPort);
  udp.write((const uint8_t*)msg, strlen(msg));
  udp.endPacket();
  Serial.print("📤 UDP: ");
  Serial.println(msg);
}

void loop() {
  if (ETH.localIP() == IPAddress(0, 0, 0, 0)) return;

  unsigned long now = millis();

  if (!sequenceComplete && (currentEvent == -1 || now >= nextEventTime)) {
    currentEvent++;
    
    if (currentEvent >= sequenceLength) {
      sequenceComplete = true;
      Serial.println("✅ Secuencia completa");
      return;
    }

    sendEvent(sequence[currentEvent].message);
    nextEventTime = now + sequence[currentEvent].delayAfter;
  }

  if (sequenceComplete && now >= nextEventTime) {
    currentEvent = -1;
    sequenceComplete = false;
    nextEventTime = now + 1000;
  }
}