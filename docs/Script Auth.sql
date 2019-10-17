
USE bxxzhhbceppsq4q640fa;
SELECT TAUth.idTypeAuth, 
	TAUth.code, 
	TAUth.name, 
	TAUth.status, 
	u.username, 
	u.idUser, 
	u.email FROM TBL_User u 
	RIGHT JOIN TBL_UserTypeAuth UAuth 
	ON u.idUser = UAuth.idUser 
	RIGHT JOIN TBL_TypeAuth TAUth 
	ON TAUth.idTypeAuth = UAuth.idTypeAuth 
	WHERE TAUth.status = 1 AND u.idUser = 1;
    
    
    
    
    SELECT * FROM TBL_UserTypeAuth;
    SELECT * FROM TBL_TypeAuth; 
    select * from TBL_User;
    
    -- Update Security
    INSERT INTO TBL_UserTypeAuth(idUserAuthType,idTypeAuth,idUser,status) 
		VALUES(null,1,2,1) ON DUPLICATE KEY UPDATE
        status = 0;
    
    -- List Auth 
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
    LEFT JOIN TBL_UserTypeAuth UTAuth
    ON TAuth.idTypeAuth = UTAuth.idTypeAuth
    LEFT JOIN TBL_User u 
    ON u.idUser = UTAuth.idUser
    WHERE TAuth.status = 1 AND (UTAuth.idUser IS NULL OR UTAuth.idUser = 2);
    
    
    
SELECT TAUth.idTypeAuth,  
TAUth.code,  
TAUth.name,  
TAUth.status,  
u.username,  
u.idUser,  
u.email FROM TBL_User u  
INNER JOIN TBL_UserTypeAuth UAuth  
ON u.idUser = UAuth.idUser  
INNER JOIN TBL_TypeAuth TAUth  
ON TAUth.idTypeAuth = UAuth.idTypeAuth  
WHERE TAUth.status = 1 AND TAUth.code='mail' AND u.idUser =  2;
    
    
    
SET SQL_SAFE_UPDATES=0;
DELETE FROM TBL_User;
SET SQL_SAFE_UPDATES=1;


