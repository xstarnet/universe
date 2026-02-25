package utils

import "regexp"

func ValidatePhone(phone string) bool {
    re := regexp.MustCompile(`^1[3-9]\d{9}$`)
    return re.MatchString(phone)
}
