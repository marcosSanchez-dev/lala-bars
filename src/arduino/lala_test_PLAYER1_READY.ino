#include <ETH.h>
#include <WiFiUdp.h>

WiFiUDP udp;
IPAddress serverIp(192, 168, 68, 101); // IP de tu laptop
const int udpPort = 4210;

// Configuración CORREGIDA para WT32-ETH01
#define ETH_PHY_ADDR       1
#define ETH_PHY_TYPE       ETH_PHY_LAN8720
#define ETH_PHY_MDC_PIN    23
#define ETH_PHY_MDIO_PIN   18
#define ETH_PHY_POWER      16
#define ETH_CLOCK_MODE     ETH_CLOCK_GPIO17_OUT

unsigned long lastSendTime = 0;
bool sendPlayer1 = true;

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
}

void loop() {
  if (ETH.localIP() != IPAddress(0, 0, 0, 0)) {
    unsigned long currentTime = millis();
    if (currentTime - lastSendTime >= 5000) { // 3 segundos

      const char* mensaje = sendPlayer1 ? "PLAYER1_READY" : "PLAYER2_READY";
      udp.beginPacket(serverIp, udpPort);
      udp.write((const uint8_t*)mensaje, strlen(mensaje));
      udp.endPacket();
      Serial.print("📤 Enviado por UDP: ");
      Serial.println(mensaje);

      sendPlayer1 = !sendPlayer1; // Alterna entre PLAYER1 y PLAYER2
      lastSendTime = currentTime;
    }
  }
}
