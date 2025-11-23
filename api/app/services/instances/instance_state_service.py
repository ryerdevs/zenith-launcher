"""
Instance State Service - Manages instance state transitions.

Responsibilities:
- Update instance states
- Validate state transitions
- Ensure state consistency
"""

import json
from pathlib import Path
from app.config import INSTANCES_DIR


class InstanceStateService:
    """Service for managing instance states."""
    
    # Valid state transitions
    VALID_TRANSITIONS = {
        'created': ['installing', 'error'],
        'installing': ['ready', 'error'],
        'ready': ['running', 'error'],
        'running': ['ready', 'error'],
        'error': ['created', 'installing']
    }
    
    def update_state(self, instance_id: str, new_state: str) -> None:
        """
        Update the state of an instance.
        
        Args:
            instance_id: ID of the instance
            new_state: New state to set
        """
        instance_folder = INSTANCES_DIR / instance_id
        config_path = instance_folder / "instance.json"
        
        if not config_path.exists():
            print(f"[STATE ERROR] Config file not found for {instance_id}")
            return
        
        try:
            # Leer configuración actual
            with open(config_path, "r", encoding='utf-8') as f:
                config = json.load(f)
            
            old_state = config.get('state', 'unknown')
            config['state'] = new_state
            
            # Escribir y forzar flush al disco
            with open(config_path, "w", encoding='utf-8') as f:
                json.dump(config, f, indent=4)
                f.flush()  # Asegurar que se escriba al disco
            
            print(f"[STATE UPDATE] {instance_id}: {old_state} -> {new_state}")
        except Exception as e:
            print(f"[STATE ERROR] Error updating state for {instance_id}: {e}")
            import traceback
            traceback.print_exc()
    
    def get_state(self, instance_id: str) -> str:
        """
        Get the current state of an instance.
        
        Args:
            instance_id: ID of the instance
            
        Returns:
            str: Current state or 'unknown' if not found
        """
        instance_folder = INSTANCES_DIR / instance_id
        config_path = instance_folder / "instance.json"
        
        if not config_path.exists():
            return 'unknown'
        
        try:
            with open(config_path, "r", encoding='utf-8') as f:
                config = json.load(f)
                return config.get('state', 'unknown')
        except Exception as e:
            print(f"Error reading state for {instance_id}: {e}")
            return 'unknown'
    
    def can_transition(self, current_state: str, target_state: str) -> bool:
        """
        Check if a state transition is valid.
        
        Args:
            current_state: Current state
            target_state: Target state
            
        Returns:
            bool: True if transition is valid
        """
        if current_state not in self.VALID_TRANSITIONS:
            return False
        
        return target_state in self.VALID_TRANSITIONS[current_state]


# Singleton instance
instance_state_service = InstanceStateService()
