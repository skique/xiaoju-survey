package com.xiaojusurvey.engine.core.user;

import com.xiaojusurvey.engine.common.entity.user.User;

import java.util.List;

public interface UserService {

    List<User> findAllUser();

    User loadUserByUsernameAndPassword(String username, String password);

    User getUserById(String userId);

    User getUserByUsername(String whitelist);
}
