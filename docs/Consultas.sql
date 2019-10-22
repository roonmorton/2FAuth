

-- Valida que exista doble autenticacion 
SELECT TAUth.idTypeAuth, 
TAUth.code, 
TAUth.name, 
UAuth.status, 
u.username, 
u.idUser, 
u.email FROM TBL_User u 
INNER JOIN TBL_UserAuthType UAuth 
ON u.idUser = UAuth.idUser 
INNER JOIN TBL_TypeAuth TAUth 
ON TAUth.idTypeAuth = UAuth.idTypeAuth 
WHERE UAuth.status = 1 AND TAUth.code='mail' AND u.idUser =  1;

-- Obtener Seguridad por usuario
SELECT  
TAuth.idTypeAuth,
UTAuth.idUserAuthType,
TAuth.code,
TAuth.description,
TAuth.status AuthStatus,
UTAuth.status,
u.username, 
u.idUser
 FROM TBL_TypeAuth TAuth
 LEFT JOIN TBL_UserAuthType UTAuth
 ON TAuth.idTypeAuth = UTAuth.idTypeAuth
 LEFT JOIN TBL_User u 
 ON u.idUser = UTAuth.idUser
 WHERE TAuth.status = 1 AND u.idUser = 5;

-- Actualizar perfil de seguridad
INSERT INTO TBL_UserAuthType(idUserAuthType,idTypeAuth,idUser,status) 
VALUES( 5 , 5 , 1 , 0 ) ON DUPLICATE KEY UPDATE 
status= 0;


-- Crea Token validacion por usuario
INSERT INTO TBL_Token 
SET token = UPPER(LEFT(UUID(), 5)), 
expirate = ADDTIME(NOW(), '00:15:00'), 
idUser =  5;


















SELECT * FROM TBL_user;
SELECT * FROM  TBL_TypeAuth;
SELECT * FROM TBL_UserAuthType;


SET SQL_SAFE_UPDATES = 0;
-- delete FROM TBL_User;
-- DELETE FROM TBL_UserAuthType;
-- DELETE FROM TBL_TypeAuth;
SET SQL_SAFE_UPDATES = 1;

-- Crear Usuario 
INSERT INTO TBL_User SET `name` = 'Ron', `lastname` = 'Quevedo', `email` = 'roonmorton@gmail.com', `phone` = '', `birthday` = NULL, `password` = 'd033e22ae348aeb5660fc2140aec35850c4da997';
