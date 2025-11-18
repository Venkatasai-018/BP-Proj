import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.bus_subscribers: Dict[int, Set[WebSocket]] = {}
        self.global_subscribers: Set[WebSocket] = set()
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        self.global_subscribers.add(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_personal_message(websocket, {
            "type": "welcome",
            "message": "Connected to Live Bus Tracking System",
            "timestamp": datetime.now().isoformat()
        })
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        self.global_subscribers.discard(websocket)
        
        # Remove from bus subscribers
        for bus_id in list(self.bus_subscribers.keys()):
            self.bus_subscribers[bus_id].discard(websocket)
            if not self.bus_subscribers[bus_id]:
                del self.bus_subscribers[bus_id]
                
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    def subscribe_to_bus(self, websocket: WebSocket, bus_id: int):
        if bus_id not in self.bus_subscribers:
            self.bus_subscribers[bus_id] = set()
        self.bus_subscribers[bus_id].add(websocket)
        logger.info(f"Client subscribed to bus {bus_id}")
    
    async def send_personal_message(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.active_connections.discard(websocket)
    
    async def broadcast_to_all(self, message: dict):
        """Broadcast message to all connected clients"""
        if not self.global_subscribers:
            return
            
        message_text = json.dumps(message)
        disconnected = set()
        
        for websocket in self.global_subscribers:
            try:
                await websocket.send_text(message_text)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected.add(websocket)
        
        # Remove disconnected clients
        for websocket in disconnected:
            self.disconnect(websocket)
    
    async def send_live_updates(self):
        """Continuous loop to send live updates to all subscribers"""
        while True:
            try:
                if self.active_connections:
                    from live_tracking import bus_simulator
                    
                    # Get all bus data
                    bus_status = bus_simulator.get_all_buses_status()
                    statistics = bus_simulator.get_statistics()
                    alerts = bus_simulator.generate_alerts()
                    
                    # Send comprehensive update
                    update_message = {
                        "type": "live_update",
                        "data": bus_status.get('buses', {}),
                        "statistics": statistics,
                        "alerts": alerts,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    await self.broadcast_to_all(update_message)
                    
                await asyncio.sleep(3)  # Send updates every 3 seconds
                
            except Exception as e:
                logger.error(f"Error in live updates loop: {e}")
                await asyncio.sleep(5)

# Handle WebSocket messages
async def handle_websocket_message(websocket: WebSocket, message: dict):
    """Handle incoming WebSocket messages"""
    try:
        message_type = message.get("type")
        
        if message_type == "ping":
            await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.now().isoformat()}))
            
        elif message_type == "get_all_buses":
            from live_tracking import bus_simulator
            bus_data = bus_simulator.get_all_buses_status()
            await websocket.send_text(json.dumps({
                "type": "all_buses",
                "data": bus_data.get('buses', {}),
                "statistics": bus_simulator.get_statistics(),
                "timestamp": datetime.now().isoformat()
            }))
            
        elif message_type == "subscribe_bus":
            bus_id = message.get("bus_id")
            if bus_id:
                connection_manager.subscribe_to_bus(websocket, bus_id)
                await websocket.send_text(json.dumps({
                    "type": "subscription_confirmed", 
                    "bus_id": bus_id,
                    "timestamp": datetime.now().isoformat()
                }))
                
        elif message_type == "get_alerts":
            from live_tracking import bus_simulator
            alerts = bus_simulator.generate_alerts()
            await websocket.send_text(json.dumps({
                "type": "alerts_update",
                "alerts": alerts,
                "timestamp": datetime.now().isoformat()
            }))
            
    except Exception as e:
        logger.error(f"Error handling WebSocket message: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Failed to process message",
            "timestamp": datetime.now().isoformat()
        }))

# Global instance
connection_manager = ConnectionManager()