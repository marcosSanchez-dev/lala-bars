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
  unsigned long delayAfter; // Tiempo a esperar DESPUÉS de este mensaje (en ms)
};

Event sequence[] = {
  { "PLAYER1_READY", 3000 },
  { "PLAYER2_READY", 3000 },
  { "FRAME13",       4000 },
  { "BARRA1_20",     2000 },
  { "BARRA2_20",     2000 },
  { "BARRA2_10",     2000 },
  { "BARRA1_10",     200  },
  { "BARRA2_100",    2000 },
  { "FRAME14",       4500 },
  
  // Modificación clave: tiempo adecuado para visualizar FRAME12
  { "FRAME12",       5000 },  // 5 segundos para visualizar
  
  { "FRAME5",        350  },
  { "BARRA1_20",     450  },
  { "BARRA2_20",     320  },
  { "BARRA2_10",     200  },
  { "BARRA1_10",     150  },
  { "BARRA2_100",    25000 }
};

const int sequenceLength = sizeof(sequence) / sizeof(sequence[0]);

int currentEvent = -1;  // Iniciar en -1 para manejar el primer evento
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
      Serial.println("❌ Fallo en conexión física (cable o router)");
      return;
    }
    delay(500);
    Serial.print(".");
  }

  timeout = millis() + 10000;
  while (ETH.localIP() == IPAddress(0, 0, 0, 0)) {
    if (millis() > timeout) {
      Serial.println("❌ Fallo al obtener IP (DHCP)");
      return;
    }
    delay(500);
    Serial.print("*");
  }

  Serial.println("\n✅ Conexión Ethernet establecida");
  Serial.print("IP asignada: ");
  Serial.println(ETH.localIP());
  Serial.print("Velocidad: ");
  Serial.print(ETH.linkSpeed());
  Serial.println("Mbps");

  nextEventTime = millis(); // Comenzar inmediatamente con el primer evento
}

void sendEvent(const char* msg) {
  udp.beginPacket(serverIp, udpPort);
  udp.write((const uint8_t*)msg, strlen(msg));
  udp.endPacket();
  Serial.print("📤 Enviado por UDP: ");
  Serial.println(msg);
}

void loop() {
  if (ETH.localIP() == IPAddress(0, 0, 0, 0)) return;

  unsigned long now = millis();

  if (!sequenceComplete && (currentEvent == -1 || now >= nextEventTime)) {
    // Avanzar al siguiente evento
    currentEvent++;
    
    if (currentEvent >= sequenceLength) {
      sequenceComplete = true;
      Serial.println("✅ Secuencia completa finalizada");
      return;
    }

    // Enviar el mensaje actual
    sendEvent(sequence[currentEvent].message);
    
    // Calcular el próximo tiempo de evento
    nextEventTime = now + sequence[currentEvent].delayAfter;
  }

  // Reiniciar la secuencia después del último delay
  if (sequenceComplete && now >= nextEventTime) {
    currentEvent = -1;
    sequenceComplete = false;
    nextEventTime = now + 1000; // Pequeño delay antes de reiniciar
  }
}