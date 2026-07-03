package com.todo.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer age;
    private LocalDate dob;
    private String gender;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String username;

    private String mobile;
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;
    private String password;
    private String role;
    
    @JsonProperty("deviceToken")
    private String fcmToken;

    private String primaryColor;
    private String bgColor;
    private String sidebarColor;
    private String cardColor;
    private String headingColor;
    private String textColor;
    private String buttonBgColor;
    private String buttonTextColor;
    private String fontSize;
    private String fontFamily;
    private String borderRadius;
    @Column(columnDefinition = "LONGTEXT")
    private String logoImage;
    private Boolean enableFontFamily = true;
    private Boolean enableFontSize = true;
    private Boolean enableBorderRadius = true;
    private Boolean enableColors = false;

    // ✅ GETTERS & SETTERS

    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }

    public String getBgColor() { return bgColor; }
    public void setBgColor(String bgColor) { this.bgColor = bgColor; }

    public String getSidebarColor() { return sidebarColor; }
    public void setSidebarColor(String sidebarColor) { this.sidebarColor = sidebarColor; }

    public String getCardColor() { return cardColor; }
    public void setCardColor(String cardColor) { this.cardColor = cardColor; }

    public String getHeadingColor() { return headingColor; }
    public void setHeadingColor(String headingColor) { this.headingColor = headingColor; }

    public String getTextColor() { return textColor; }
    public void setTextColor(String textColor) { this.textColor = textColor; }

    public String getButtonBgColor() { return buttonBgColor; }
    public void setButtonBgColor(String buttonBgColor) { this.buttonBgColor = buttonBgColor; }

    public String getButtonTextColor() { return buttonTextColor; }
    public void setButtonTextColor(String buttonTextColor) { this.buttonTextColor = buttonTextColor; }

    public String getFontSize() { return fontSize; }
    public void setFontSize(String fontSize) { this.fontSize = fontSize; }

    public String getFontFamily() { return fontFamily; }
    public void setFontFamily(String fontFamily) { this.fontFamily = fontFamily; }

    public String getBorderRadius() { return borderRadius; }
    public void setBorderRadius(String borderRadius) { this.borderRadius = borderRadius; }

    public String getLogoImage() { return logoImage; }
    public void setLogoImage(String logoImage) { this.logoImage = logoImage; }

    public Boolean getEnableFontFamily() { return enableFontFamily; }
    public void setEnableFontFamily(Boolean enableFontFamily) { this.enableFontFamily = enableFontFamily; }

    public Boolean getEnableFontSize() { return enableFontSize; }
    public void setEnableFontSize(Boolean enableFontSize) { this.enableFontSize = enableFontSize; }

    public Boolean getEnableBorderRadius() { return enableBorderRadius; }
    public void setEnableBorderRadius(Boolean enableBorderRadius) { this.enableBorderRadius = enableBorderRadius; }

    public Boolean getEnableColors() { return enableColors; }
    public void setEnableColors(Boolean enableColors) { this.enableColors = enableColors; }

    public String getFcmToken() {
        return fcmToken;
    }

    public void setFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

}

    
        
    