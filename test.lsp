
; (prog
;   (set a 12)
;   (prog 
; 	(set a 14)
; 	(print a))
;   (print a))


(defun fact (# a)
  (if (eq a 0)
	(id 1)
	(* a (fact (- a 1)))))


(set b (fact 15))
(print (id "=>") b)


; (set a 12)

; (- a 12)

; (print a)
