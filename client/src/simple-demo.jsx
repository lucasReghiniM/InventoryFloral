import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Componente de demonstração simples
function SimpleDemo() {
  const [suppliers, setSuppliers] = useState([
    { id: "1", name: "Fornecedor 1" },
    { id: "2", name: "Fornecedor 2" },
    { id: "3", name: "Fornecedor 3" }
  ]);
  
  const [products, setProducts] = useState([
    { id: 1, name: "Rosas", price: 5.00 },
    { id: 2, name: "Tulipas", price: 3.50 },
    { id: 3, name: "Girassóis", price: 4.25 }
  ]);
  
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedSuppliers, setAddedSuppliers] = useState([]);
  
  const handleAddSupplier = () => {
    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (supplier && price) {
      setAddedSuppliers([...addedSuppliers, { ...supplier, price: parseFloat(price) }]);
      setSelectedSupplier("");
      setPrice("");
    }
  };
  
  const handleRemoveSupplier = (id) => {
    setAddedSuppliers(addedSuppliers.filter(s => s.id !== id));
  };
  
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
    const product = products.find(p => p.id.toString() === e.target.value);
    if (product) {
      // Atualizar o preço com base no produto selecionado
      setPrice(product.price.toString());
    }
  };
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Demonstração de Dropdowns Pesquisáveis</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Fornecedores */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h2>Adicionar Fornecedores</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Fornecedores Adicionados:</h3>
            {addedSuppliers.length === 0 ? (
              <p>Nenhum fornecedor adicionado</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {addedSuppliers.map(supplier => (
                  <li 
                    key={supplier.id} 
                    style={{ 
                      border: '1px solid #eee', 
                      padding: '10px', 
                      marginBottom: '8px', 
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{supplier.name} - R$ {supplier.price.toFixed(2)}</span>
                    <button 
                      onClick={() => handleRemoveSupplier(supplier.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: 'red' 
                      }}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Selecionar Fornecedor:</label>
            <select 
              value={selectedSupplier} 
              onChange={e => setSelectedSupplier(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="">Selecione um fornecedor</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Preço:</label>
            <input 
              type="number" 
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
              placeholder="Digite o preço"
            />
          </div>
          
          <button 
            onClick={handleAddSupplier}
            disabled={!selectedSupplier || !price}
            style={{ 
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              opacity: (!selectedSupplier || !price) ? 0.5 : 1
            }}
          >
            Adicionar Fornecedor
          </button>
        </div>
        
        {/* Produtos */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h2>Selecionar Produtos</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Produto:</label>
            <select 
              value={selectedProduct} 
              onChange={handleProductChange}
              style={{ 
                width: '100%', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="">Selecione um produto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Preço Unitário:</label>
            <input 
              type="text" 
              value={price ? `R$ ${parseFloat(price).toFixed(2)}` : ""}
              readOnly
              style={{ 
                width: '100%', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Quantidade:</label>
            <input 
              type="number" 
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ 
                width: '100%', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Valor Total:</label>
            <input 
              type="text" 
              value={price && quantity ? `R$ ${(parseFloat(price) * quantity).toFixed(2)}` : "R$ 0.00"}
              readOnly
              style={{ 
                width: '100%', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
          
          <button 
            style={{ 
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              opacity: !selectedProduct ? 0.5 : 1
            }}
            disabled={!selectedProduct}
          >
            Adicionar ao Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

// Renderizar a demo
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<SimpleDemo />);
}