INSERT INTO "public"."orders" (
    "id", "order_number", "color", "wheel_type", "customer_name", 
    "customer_email", "customer_phone", "customer_cpf", "payment_method", 
    "total_price", "status", "created_at", "updated_at", "optionals"
) VALUES 
('1bea8bde-d1b1-4a4e-8d7c-a0f9410b6d71', 'VLO-HXGYL5', 'glacier-blue', 'aero', 'Maria Souza', 'maria.souza@email.com', '(11) 98888-8888', '', 'avista', '40000', 'APROVADO', '2026-04-19 13:53:23.020378+00', '2026-04-19 13:53:23.020378+00', ARRAY[]::text[]), 
('4e5e57c2-9817-45a8-a0eb-9b1ee648f544', 'VLO-Y1X3GG', 'glacier-blue', 'aero', 'Marcos Vinicius', 'marcos@email.com', '(11) 94444-4444', '', 'financiamento', '40400', 'APROVADO', '2026-04-19 13:54:05.775661+00', '2026-04-19 13:54:05.775661+00', ARRAY[]::text[]), 
('5c49ef3b-df16-4101-bf98-9fd4df5b342a', 'VLO-5VWWRW', 'glacier-blue', 'sport', 'Aline Dias', 'alineafd.dias@gmail.com', '(11) 99999-9999', '082.455.340-30', 'avista', '47500', 'APROVADO', '2026-04-19 13:37:19.32171+00', '2026-04-19 13:37:19.32171+00', ARRAY['precision-park']::text[]), 
('8d97fe81-fd70-441d-91e0-1d7d3e0b6dbd', 'VLO-6VWR8L', 'glacier-blue', 'aero', 'Ana Luiza', 'ana.luiza@email.com', '(11) 96666-6666', '', 'financiamento', '40800', 'EM_ANALISE', '2026-04-19 13:53:47.440368+00', '2026-04-19 13:53:47.440368+00', ARRAY[]::text[]), 
('eb97b9ca-c650-4b03-9ee6-f1046ce57602', 'VLO-HU2D4Q', 'glacier-blue', 'aero', 'Pedro Paulo', 'pedro@email.com', '(11) 95555-5555', '', 'financiamento', '40800', 'REPROVADO', '2026-04-19 13:54:03.778716+00', '2026-04-19 13:54:03.778716+00', ARRAY[]::text[]), 
('fe738aa9-fbb8-4c1f-bbe7-c25e5761405f', 'VLO-CFL0A5', 'glacier-blue', 'aero', 'Carlos Silva', 'carlos@email.com', '(11) 97777-7777', '', 'financiamento', '40800', 'APROVADO', '2026-04-19 13:53:44.814346+00', '2026-04-19 13:53:44.814346+00', ARRAY[]::text[]);