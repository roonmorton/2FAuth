-- Gerar TOken de validacion
SELECT UPPER(LEFT(MD5(NOW()), 5)) AS CODE;
SELECT UPPER(LEFT(UUID(), 5)) AS CODE;

-- Fecha expiracion suma 15 minutos
SELECT NOW() AS FNOW , ADDTIME(NOW(), '00:10:00') AS TMinutes;

-- 


SELECT * FROM TBL_User;
SELECT * FROM TBL_Token WHERE expirate >= now();
INSERT INTO TBL_Token 
	SET token = UPPER(LEFT(UUID(), 5)), 
	expirate = ADDTIME(NOW(), '00:15:00'), 
	idUser = 2;
    
    
DROP TABLE TBL_Token;
CREATE TABLE IF NOT EXISTS `bcsn2p2qgn5m7jopbpjn`.`TBL_Token` (
`idToken` INT NOT NULL AUTO_INCREMENT,
`token` VARCHAR(5) NOT NULL,
`expirate` TIMESTAMP NULL,
`create_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
`update_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
`idUser` INT NOT NULL,
`idTypeAuth` INT NULL,
PRIMARY KEY (`idToken`),
INDEX `fk_TBL_Token_TBL_User1_idx` (`idUser` ASC) VISIBLE,
INDEX `fk_TBL_Token_TBL_TypeAuth1_idx` (`idTypeAuth` ASC) VISIBLE,
CONSTRAINT `fk_TBL_Token_TBL_User1`
FOREIGN KEY (`idUser`)
REFERENCES `bcsn2p2qgn5m7jopbpjn`.`TBL_User` (`idUser`)
ON DELETE NO ACTION
ON UPDATE NO ACTION,
CONSTRAINT `fk_TBL_Token_TBL_TypeAuth1`
FOREIGN KEY (`idTypeAuth`)
REFERENCES `bcsn2p2qgn5m7jopbpjn`.`TBL_TypeAuth` (`idTypeAuth`)
ON DELETE NO ACTION
ON UPDATE NO ACTION)
ENGINE = InnoDB;