---
component: knowledge_models
description: Contains models for knowledge representation and management in MABOS
main-technologies:
  - Python
  - Pydantic
  - OWL (Web Ontology Language)
conventions:
  - Use Pydantic for data validation and serialization
  - Align models with ontology structures
  - Implement clear interfaces for knowledge operations
---

# Knowledge Models Component

This directory contains models for knowledge representation and management in the MABOS system. These models define the structure and properties of various knowledge-related concepts, enabling sophisticated knowledge handling and reasoning capabilities.

## Structure

- `__init__.py`: Initialization and common imports
- `base.py`: Base classes for knowledge representation
- `knowledge_base.py`: Model for knowledge base structure
- `knowledge_graph.py`: Model for knowledge graph representation
- `ontology/`: Subdirectory for ontology-related models
- `reasoning/`: Subdirectory for reasoning-related models
- `topic_map.py`: Model for topic map representation

## Key Responsibilities

1. Defining data structures for knowledge representation
2. Ensuring data integrity and validation for knowledge entities
3. Facilitating knowledge querying and manipulation
4. Providing a consistent interface for working with knowledge-related information
5. Supporting various knowledge representation paradigms

## Development Guidelines

- Use Pydantic models for data validation and serialization
- Align model structures with corresponding ontology concepts
- Implement clear methods for knowledge operations (e.g., querying, updating)
- Use type hints and docstrings for better code readability

## Model Implementation

When creating or modifying a knowledge-related model:
- Clearly define the model's purpose and its role in knowledge representation
- Consider relationships with other knowledge models and ontology structures
- Implement appropriate data validation rules
- Ensure consistency with established knowledge representation standards

## Usage Example

```python
from app.models.knowledge.knowledge_graph import KnowledgeGraph, Node, Edge

def create_simple_knowledge_graph():
    nodes = [
        Node(id="1", label="Person", properties={"name": "John Doe"}),
        Node(id="2", label="Company", properties={"name": "ACME Corp"})
    ]
    edges = [
        Edge(source="1", target="2", label="WORKS_FOR")
    ]
    return KnowledgeGraph(nodes=nodes, edges=edges)
```

Remember to update the `README.md` in this directory when adding new knowledge-related models or making significant changes to existing ones.
